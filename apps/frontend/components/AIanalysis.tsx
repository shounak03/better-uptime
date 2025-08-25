import { AIAnalysis } from "@/lib/types";

export function AIAnalysisCard({ analysis }: { analysis: AIAnalysis }) {
    const getSeverityConfig = (severity: string) => {
        switch (severity.toUpperCase()) {
            case 'CRITICAL':
                return {
                    color: 'bg-red-50 border-red-200 text-red-800',
                    badge: 'bg-red-100 text-red-800',
                    icon: '🚨'
                };
            case 'HIGH':
                return {
                    color: 'bg-orange-50 border-orange-200 text-orange-800',
                    badge: 'bg-orange-100 text-orange-800',
                    icon: '⚠️'
                };
            case 'MEDIUM':
                return {
                    color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                    badge: 'bg-yellow-100 text-yellow-800',
                    icon: '⚡'
                };
            default:
                return {
                    color: 'bg-blue-50 border-blue-200 text-blue-800',
                    badge: 'bg-blue-100 text-blue-800',
                    icon: 'ℹ️'
                };
        }
    };

    const config = getSeverityConfig(analysis.severity);

    return (
        <div className={`rounded-lg border-2 p-6 ${config.color}`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                        <h3 className="text-lg font-semibold">AI Failure Analysis</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.badge}`}>
                                {analysis.severity}
                            </span>
                            <span className="text-sm text-gray-600">
                                {analysis.failureType}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-600">Confidence</div>
                    <div className="text-lg font-semibold">
                        {Math.round(analysis.confidence * 100)}%
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <h4 className="font-medium mb-2">What happened?</h4>
                <p className="text-gray-700 leading-relaxed">
                    {analysis.summary}
                </p>
            </div>

            <div className="mb-4">
                <h4 className="font-medium mb-2">Recommended Actions</h4>
                <div className="bg-white/50 rounded-lg p-3">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                        {analysis.recommendations}
                    </pre>
                </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Analyzed by {analysis.model}</span>
                <span>{new Date(analysis.analyzedAt).toLocaleString()}</span>
            </div>
        </div>
    );
}

