import { WebsiteTick } from "@/lib/types";


export function StatusChart({ ticks }: { ticks: WebsiteTick[] }) {
    const maxTicks = 50;
    const displayTicks = ticks.slice(0, maxTicks);

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status History</h3>
            
            {displayTicks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📊</div>
                    <p>No status checks recorded yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Visual timeline */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">
                            Recent Activity (Latest {displayTicks.length} checks)
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                            {displayTicks.map((tick, index) => (
                                <div
                                    key={index}
                                    className={`w-3 h-3 rounded-sm ${
                                        tick.status.toLowerCase() === 'up' 
                                            ? 'bg-green-500' 
                                            : tick.status.toLowerCase() === 'down'
                                            ? 'bg-red-500'
                                            : 'bg-yellow-500'
                                    }`}
                                    title={`${tick.status.toUpperCase()} - ${new Date(tick.timeAdded).toLocaleString()}`}
                                />
                            ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                            Hover over bars to see details • Green = Up • Red = Down • Yellow = Unknown
                        </div>
                    </div>

                    {/* Recent checks table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 font-medium text-gray-700">Status</th>
                                    <th className="text-left py-2 font-medium text-gray-700">Response Time</th>
                                    <th className="text-left py-2 font-medium text-gray-700">Details</th>
                                    <th className="text-left py-2 font-medium text-gray-700">Checked At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayTicks.slice(0, 10).map((tick, index) => (
                                    <tr key={index} className="border-b border-gray-100">
                                        <td className="py-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                tick.status.toLowerCase() === 'up' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : tick.status.toLowerCase() === 'down'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {tick.status.toLowerCase() === 'up' ? '✓' : 
                                                 tick.status.toLowerCase() === 'down' ? '✗' : '?'}
                                                {tick.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="py-3 text-gray-600">
                                            {tick.responseTime ? `${tick.responseTime}ms` : 'N/A'}
                                        </td>
                                        <td className="py-3 text-gray-600">
                                            <div className="space-y-1">
                                                {tick.httpStatusCode && (
                                                    <div className="text-xs">
                                                        HTTP {tick.httpStatusCode}
                                                    </div>
                                                )}
                                                {tick.errorType && (
                                                    <div className="text-xs text-red-600">
                                                        {tick.errorType}
                                                    </div>
                                                )}
                                                {tick.errorMessage && (
                                                    <div className="text-xs text-gray-500 truncate max-w-xs" title={tick.errorMessage}>
                                                        {tick.errorMessage}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 text-gray-600">
                                            {new Date(tick.timeAdded).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}