import { Pen } from "lucide-react";

// Logo component
const Logo = ({ gradientText = false, className = "" }: { gradientText?: boolean; className?: string }) => (
    <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Pen className="w-5 h-5 text-white" />
        </div>
        <span className={`text-xl font-bold ${gradientText ? "bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent" : ""}`}>
            FlowDraw
        </span>
    </div>
);

export default Logo;