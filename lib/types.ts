export type AnalysisResult = {
  confidence: "low" | "medium" | "high";
  equipmentType: string;
  visibleComponents: string[];
  possibleIssues: string[];
  safeTroubleshootingChecklist: string[];
  technicianQuestions: string[];
  recommendedNextSteps: string[];
  safetyWarnings: string[];
  customerReport: string;
};

export type JobRecord = {
  id: string;
  user_id: string;
  description: string;
  question: string | null;
  image_url: string | null;
  image_path: string | null;
  analysis: AnalysisResult;
  created_at: string;
};
