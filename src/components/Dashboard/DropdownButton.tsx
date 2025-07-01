import { Clock, Layers, LogOut, Settings, Share2, Star, User, Mail } from "lucide-react";
import { DropdownButtonProps } from "../../types";

export default function DropdownButton({ content, handleClick, color, icon }: DropdownButtonProps): JSX.Element {
    return (
        <button
            className={`w-full text-left px-4 py-2 text-${color}-700 hover:bg-${color}-50 flex items-center`}
            onClick={handleClick}
        >
            {icon === 'user' && <User className="w-4 h-4 mr-3" />}
            {icon === 'settings' && <Settings className="w-4 h-4 mr-3" />}
            {icon === 'logout' && <LogOut className="w-4 h-4 mr-3" />}
            {icon === 'layers' && <Layers className="w-4 h-4 mr-3" />}
            {icon === 'star' && <Star className="w-4 h-4 mr-3" />}
            {icon === 'clock' && <Clock className="w-4 h-4 mr-3" />}
            {icon === 'share-2' && <Share2 className="w-4 h-4 mr-3" />}
            {icon === 'invitations' && <Mail className="w-4 h-4 mr-3" />}
            {content}
        </button>
    );
}