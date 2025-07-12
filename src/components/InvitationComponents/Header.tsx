import { ArrowLeft, Pen } from "lucide-react";
import IconButton from "../Buttons/IconButton";

const Header: React.FC<{
    onGoBack?: () => void;
    pendingCount: number;
}> = ({ onGoBack, pendingCount }) => (
    <header className="relative z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-4">
                    {onGoBack && (
                        <IconButton onClick={onGoBack}>
                            <ArrowLeft className="w-5 h-5" />
                        </IconButton>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Invitations</h1>
                        {pendingCount > 0 && (
                            <p className="text-sm text-slate-600">
                                You have {pendingCount} pending invitation{pendingCount !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Pen className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        FlowDraw
                    </span>
                </div>
            </div>
        </div>
    </header>
);

export default Header;