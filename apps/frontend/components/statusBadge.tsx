export function StatusBadge({ status }: { status: string }) {
    const getStatusConfig = (status: string) => {
        switch (status.toLowerCase()) {
            case 'up': 
                return {
                    color: 'bg-green-100 text-green-800 border-green-200',
                    icon: '✓',
                    text: 'ONLINE'
                };
            case 'down': 
                return {
                    color: 'bg-red-100 text-red-800 border-red-200',
                    icon: '✗',
                    text: 'OFFLINE'
                };
            default: 
                return {
                    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    icon: '?',
                    text: 'UNKNOWN'
                };
        }
    };

    const config = getStatusConfig(status);

    return (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-medium ${config.color}`}>
            <span className="text-lg">{config.icon}</span>
            <span>{config.text}</span>
        </div>
    );
}
