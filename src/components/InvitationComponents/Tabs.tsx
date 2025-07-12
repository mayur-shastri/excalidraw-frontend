const Tabs: React.FC<{
    activeTab: string;
    setActiveTab: (tab: 'pending' | 'accepted' | 'rejected' | 'all') => void;
    counts: {
        countPending: number;
        countAccepted: number;
        countRejected: number;
        countAll: number;
    };
}> = ({ activeTab, setActiveTab, counts }) => {
    const tabs = [
        { key: 'pending', label: 'Pending', count: counts.countPending },
        { key: 'accepted', label: 'Accepted', count: counts.countAccepted },
        { key: 'rejected', label: 'Rejected', count: counts.countRejected },
        { key: 'all', label: 'All', count: counts.countAll },
    ];

    return (
        <div className="flex items-center bg-white/60 backdrop-blur-sm rounded-lg p-1 border border-slate-200/60">
            {tabs.map(tab => (
                <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`px-4 py-2 rounded-md font-medium transition-all flex items-center space-x-2 ${
                        activeTab === tab.key
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                    }`}
                >
                    <span>{tab.label}</span>
                    <span
                        className={`text-xs px-2 py-1 rounded-full ${
                            activeTab === tab.key
                                ? 'bg-indigo-100 text-indigo-600'
                                : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                        {tab.count}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default Tabs;