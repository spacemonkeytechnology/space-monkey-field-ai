import OpenAI, { APIError } from "openai";
import type { Responses } from "openai/resources/responses/responses";
import type { AnalysisResult } from "@/lib/types";

const OPENAI_MODEL = process.env.OPENAI_FIELD_ANALYSIS_MODEL || "gpt-5.4-mini";

type AnalyzeJobParams = {
  description: string;
  question?: string;
  imageBase64: string;
  imageMimeType: "image/jpeg" | "image/png" | "image/webp";
  imageSizeBytes: number;
  requestId: string;
};

type OpenAIRequestSummary = {
  model: string;
  endpoint: "responses.create";
  inputContentTypes: Array<"input_text" | "input_image">;
  image: {
    mimeType: AnalyzeJobParams["imageMimeType"];
    sizeBytes: number;
    base64Bytes: number;
    dataUrlPrefix: string;
  };
  text: {
    descriptionLength: number;
    questionLength: number;
    schemaName: string;
  };
};

export class OpenAIAnalysisError extends Error {
  status?: number;
  code?: string | null;
  type?: string | null;
  param?: string | null;
  requestId?: string | null;
  responseBody?: unknown;
  requestPayload?: unknown;
  requestSummary: OpenAIRequestSummary;

  constructor(message: string, details: Partial<OpenAIAnalysisError> & { requestSummary: OpenAIRequestSummary }) {
    super(message);
    this.name = "OpenAIAnalysisError";
    this.status = details.status;
    this.code = details.code;
    this.type = details.type;
    this.param = details.param;
    this.requestId = details.requestId;
    this.responseBody = details.responseBody;
    this.requestPayload = details.requestPayload;
    this.requestSummary = details.requestSummary;
  }
}

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing.");
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    maxRetries: 2,
    timeout: 60_000,
  });
}

function resultSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      confidence: { type: "string", enum: ["low", "medium", "high"] },
      equipmentType: { type: "string" },
      visibleComponents: {
        type: "array",
        items: { type: "string" },
        description: "Visible components or conditions observed in the image.",
      },
      possibleIssues: {
        type: "array",
        items: { type: "string" },
        description: "Potential issues inferred cautiously from the image and technician notes.",
      },
      safeTroubleshootingChecklist: {
        type: "array",
        items: { type: "string" },
        description: "Safe, non-invasive checks only. Do not include dangerous procedural work.",
      },
      technicianQuestions: { type: "array", items: { type: "string" } },
      recommendedNextSteps: { type: "array", items: { type: "string" } },
      safetyWarnings: { type: "array", items: { type: "string" } },
      customerReport: { type: "string" },
    },
    required: [
      "confidence",
      "equipmentType",
      "visibleComponents",
      "possibleIssues",
      "safeTroubleshootingChecklist",
      "technicianQuestions",
      "recommendedNextSteps",
      "safetyWarnings",
      "customerReport",
    ],
  } as const;
}

function buildPrompt(params: Pick<AnalyzeJobParams, "description" | "question">) {
  return [
    "You are Space Monkey Field AI, a cautious field-service assistant for technicians.",
    "Analyze the job-site image and technician notes.",
    "Be practical, clear, and concise.",
    "Do not provide step-by-step instructions for dangerous electrical, gas, chemical, or structural work.",
    "Do not tell a technician to bypass safety devices, open energized panels, repair gas lines, disturb hazardous materials, or assess structural integrity from an image.",
    "Recommend licensed professionals for high-risk issues.",
    "Clearly say when the AI is uncertain or when an image is insufficient.",
    "Always include that image analysis is not a replacement for professional inspection.",
    "Keep safe troubleshooting limited to visual checks, documentation, power-off observations, customer questions, and escalation guidance.",
    `Technician description: ${params.description}`,
    `Technician question: ${params.question || "No specific question provided."}`,
  ].join("\n");
}

function buildRequestSummary(params: AnalyzeJobParams): OpenAIRequestSummary {
  return {
    model: OPENAI_MODEL,
    endpoint: "responses.create",
    inputContentTypes: ["input_text", "input_image"],
    image: {
      mimeType: params.imageMimeType,
      sizeBytes: params.imageSizeBytes,
      base64Bytes: Buffer.byteLength(params.imageBase64, "utf8"),
      dataUrlPrefix: `data:${params.imageMimeType};base64,`,
    },
    text: {
      descriptionLength: params.description.length,
      questionLength: params.question?.length ?? 0,
      schemaName: "field_job_analysis",
    },
  };
}

function parseAnalysisOutput(
  outputText: string,
  requestSummary: OpenAIRequestSummary,
  requestPayload: unknown,
): AnalysisResult {
  try {
    return JSON.parse(outputText) as AnalysisResult;
  } catch (error) {
    throw new OpenAIAnalysisError("OpenAI returned output that was not valid JSON.", {
      requestSummary,
      requestPayload,
      responseBody: {
        outputTextPreview: outputText.slice(0, 1000),
        parseError: error instanceof Error ? error.message : String(error),
      },
    });
  }
}

function normalizeOpenAIError(
  error: unknown,
  requestSummary: OpenAIRequestSummary,
  requestPayload: unknown,
): OpenAIAnalysisError {
  if (error instanceof OpenAIAnalysisError) {
    error.requestPayload ??= requestPayload;
    return error;
  }

  if (error instanceof APIError) {
    const errorBody = error.error as
      | {
          message?: string;
          type?: string;
          param?: string | null;
          code?: string | null;
        }
      | undefined;

    return new OpenAIAnalysisError(error.message || "OpenAI API request failed.", {
      requestSummary,
      requestPayload,
      status: error.status,
      code: errorBody?.code ?? null,
      type: errorBody?.type ?? null,
      param: errorBody?.param ?? null,
      requestId: error.requestID,
      responseBody: error.error,
    });
  }

  return new OpenAIAnalysisError(error instanceof Error ? error.message : "Unexpected OpenAI integration error.", {
    requestSummary,
    requestPayload,
    responseBody: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
  });
}

export function logOpenAIAnalysisError(params: {
  appRequestId: string;
  userId?: string;
  error: OpenAIAnalysisError;
}) {
  console.error(
    "[openai:field-analysis:error]",
    JSON.stringify(
      {
        appRequestId: params.appRequestId,
        userId: params.userId,
        message: params.error.message,
        status: params.error.status,
        code: params.error.code,
        type: params.error.type,
        param: params.error.param,
        openaiRequestId: params.error.requestId,
        requestSummary: params.error.requestSummary,
        requestPayload: params.error.requestPayload,
        response: params.error.responseBody,
      },
      null,
      2,
    ),
  );
}

export async function analyzeJobImage(params: AnalyzeJobParams): Promise<AnalysisResult> {
  const client = getOpenAIClient();
  const requestSummary = buildRequestSummary(params);
  const prompt = buildPrompt(params);
  const imageUrl = `data:${params.imageMimeType};base64,${params.imageBase64}`;

  const request: Responses.ResponseCreateParamsNonStreaming = {
    model: OPENAI_MODEL,
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: prompt },
          {
            type: "input_image",
            image_url: imageUrl,
            detail: "auto",
          },
        ],
      },
    ],
    max_output_tokens: 1800,
    text: {
      format: {
        type: "json_schema",
        name: "field_job_analysis",
        strict: true,
        schema: resultSchema(),
      },
    },
  };
  const redactedRequestPayload = {
    ...request,
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: prompt },
          {
            type: "input_image",
            image_url: `[redacted data URL; ${params.imageMimeType}; ${params.imageSizeBytes} bytes]`,
            detail: "auto",
          },
        ],
      },
    ],
  };

  console.info(
    "[openai:field-analysis:request]",
    JSON.stringify(
      {
        appRequestId: params.requestId,
        request: requestSummary,
      },
      null,
      2,
    ),
  );

  try {
    const { data: response, request_id: openaiRequestId } = await client.responses
      .create(request)
      .withResponse();

    console.info(
      "[openai:field-analysis:response]",
      JSON.stringify(
        {
          appRequestId: params.requestId,
          openaiRequestId,
          model: response.model,
          status: response.status,
          error: response.error,
          incompleteDetails: response.incomplete_details,
          usage: response.usage,
          outputTextLength: response.output_text?.length ?? 0,
        },
        null,
        2,
      ),
    );

    if (response.status === "failed" || response.error) {
      throw new OpenAIAnalysisError(response.error?.message || "OpenAI response failed.", {
        requestSummary,
        requestPayload: redactedRequestPayload,
        requestId: openaiRequestId,
        code: response.error?.code,
        responseBody: {
          status: response.status,
          error: response.error,
          incompleteDetails: response.incomplete_details,
          usage: response.usage,
        },
      });
    }

    if (response.status === "incomplete") {
      throw new OpenAIAnalysisError("OpenAI response was incomplete.", {
        requestSummary,
        requestPayload: redactedRequestPayload,
        requestId: openaiRequestId,
        responseBody: {
          status: response.status,
          incompleteDetails: response.incomplete_details,
          usage: response.usage,
        },
      });
    }

    if (!response.output_text) {
      throw new OpenAIAnalysisError("OpenAI response did not include output_text.", {
        requestSummary,
        requestPayload: redactedRequestPayload,
        requestId: openaiRequestId,
        responseBody: {
          id: response.id,
          status: response.status,
          output: response.output,
          usage: response.usage,
        },
      });
    }

    return parseAnalysisOutput(response.output_text, requestSummary, redactedRequestPayload);
  } catch (error) {
    throw normalizeOpenAIError(error, requestSummary, redactedRequestPayload);
  }
}
