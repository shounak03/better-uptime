export interface WebsiteTick {
    status: string;
    responseTime: number | null;
    timeAdded: string;
    httpStatusCode?: number;
    errorType?: string;
    errorMessage?: string;
    aiAnalysis?: AIAnalysis;
}
export interface AIAnalysis {
    id: string;
    failureType: string;
    severity: string;
    summary: string;
    recommendations: string;
    confidence: number;
    analyzedAt: string;
    model: string;
}
