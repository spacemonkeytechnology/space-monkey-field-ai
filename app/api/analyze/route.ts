import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { OpenAIAnalysisError, analyzeJobImage, logOpenAIAnalysisError } from "@/lib/openai";
import { createAdminClient } from "@/lib/supabase-admin";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type AcceptedImageType = (typeof ACCEPTED_TYPES)[number];

export const runtime = "nodejs";
export const maxDuration = 90;

function isAcceptedImageType(type: string): type is AcceptedImageType {
  return ACCEPTED_TYPES.some((acceptedType) => acceptedType === type);
}

function errorResponse(message: string, status = 400, requestId?: string) {
  return NextResponse.json({ error: message, requestId }, { status });
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();

  try {
    console.info("[analysis:request:start]", JSON.stringify({ requestId }));

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return errorResponse("Missing authentication token.", 401, requestId);
    }

    const userClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    );

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser(token);

    if (userError || !user) {
      console.warn(
        "[analysis:auth:error]",
        JSON.stringify({ requestId, message: userError?.message }),
      );
      return errorResponse("Unable to verify your session.", 401, requestId);
    }

    const formData = await request.formData();
    const description = String(formData.get("description") || "").trim();
    const question = String(formData.get("question") || "").trim();
    const image = formData.get("image");

    if (!description) {
      return errorResponse("A short issue description is required.", 400, requestId);
    }

    if (!(image instanceof File)) {
      return errorResponse("A job-site image is required.", 400, requestId);
    }

    if (!isAcceptedImageType(image.type)) {
      return errorResponse("Upload a JPEG, PNG, or WebP image.", 400, requestId);
    }

    if (image.size > MAX_IMAGE_SIZE) {
      return errorResponse("Image must be smaller than 8 MB.", 400, requestId);
    }

    console.info(
      "[analysis:input]",
      JSON.stringify({
        requestId,
        userId: user.id,
        descriptionLength: description.length,
        questionLength: question.length,
        image: {
          name: image.name,
          type: image.type,
          size: image.size,
        },
      }),
    );

    const imageBuffer = Buffer.from(await image.arrayBuffer());
    const imageBase64 = imageBuffer.toString("base64");

    const analysis = await analyzeJobImage({
      description,
      question,
      imageBase64,
      imageMimeType: image.type,
      imageSizeBytes: image.size,
      requestId,
    });

    const admin = createAdminClient();
    const extension = image.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
    const imagePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

    const upload = await admin.storage
      .from("job-images")
      .upload(imagePath, imageBuffer, {
        contentType: image.type,
        upsert: false,
      });

    if (upload.error) {
      console.error(
        "[analysis:supabase-storage:error]",
        JSON.stringify({ requestId, userId: user.id, error: upload.error }),
      );
      throw new Error(upload.error.message);
    }

    const { data: publicUrl } = admin.storage.from("job-images").getPublicUrl(imagePath);

    const insert = await admin
      .from("jobs")
      .insert({
        user_id: user.id,
        description,
        question: question || null,
        image_path: imagePath,
        image_url: publicUrl.publicUrl,
        analysis,
      })
      .select("id")
      .single();

    if (insert.error || !insert.data) {
      console.error(
        "[analysis:supabase-db:error]",
        JSON.stringify({ requestId, userId: user.id, error: insert.error }),
      );
      throw new Error(insert.error?.message || "Unable to save job report.");
    }

    console.info(
      "[analysis:request:complete]",
      JSON.stringify({ requestId, userId: user.id, jobId: insert.data.id }),
    );

    return NextResponse.json({ jobId: insert.data.id, requestId });
  } catch (error) {
    if (error instanceof OpenAIAnalysisError) {
      logOpenAIAnalysisError({ appRequestId: requestId, error });
      return errorResponse(
        "The AI analysis service returned an error. Please retry with a clear image, or contact support with this request ID.",
        502,
        requestId,
      );
    }

    const message = error instanceof Error ? error.message : "Unexpected analysis error.";
    console.error(
      "[analysis:request:error]",
      JSON.stringify({
        requestId,
        message,
        error: error instanceof Error ? { name: error.name, stack: error.stack } : error,
      }),
    );
    return errorResponse(message, 500, requestId);
  }
}
