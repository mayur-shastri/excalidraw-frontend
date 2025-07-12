import { Mail } from "lucide-react";

const EmptyState: React.FC<{ searchQuery: string; selectedFilter: string }> = ({ searchQuery, selectedFilter }) => (
    <div className="text-center py-16">
        <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">No invitations found</h3>
        <p className="text-slate-600">
            {searchQuery || selectedFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : "You don't have any invitations at the moment."
            }
        </p>
    </div>
);

export default EmptyState;