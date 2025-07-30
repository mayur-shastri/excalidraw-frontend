import { Clock, MoreHorizontal } from "lucide-react";
import IconButton from "../Buttons/IconButton";
import StarButton from "../Buttons/StarButton";
import axios from "axios";
import { useEffect, useState } from "react";
import { Connection, DrawElement } from "../../types";
import { toast } from "sonner";
import { supabase } from "../../utils/supabaseClient";
import CanvasPreview from "./CanvasPreview";
import { useDiagramContext } from "../../contexts/DiagramContext/DiagramContext";
import { useNavigate } from "react-router-dom";

// DrawingCard
const DrawingCard = ({ drawing }: any) => {

    const [elements, setElements] = useState<DrawElement[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [date, setDate] = useState<string>("");

    const {setCurrentDiagramIdPersistently}  = useDiagramContext();
    const navigate = useNavigate();

    const onClick = async () => {
        setCurrentDiagramIdPersistently(drawing.id);
        navigate('/draw');
    }

    const calculateDate = (isoDate: string) => {
        const date = new Date(isoDate);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return `${seconds}s ago`;
    };

    const fetchDiagramDetails = async () => {
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) {
                toast.error(sessionError?.message || 'User not authenticated');
                return;
            }

            const accessToken = session.access_token;
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/diagrams/get/${drawing.id}`);
            setElements(res.data.elements);
            setConnections(res.data.connections);
            setDate(calculateDate(res.data.updatedAt));
        } catch (error) {
            toast.error("Failed to load diagram preview.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiagramDetails();
    }, []);



    return (
        <div onClick={onClick} className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200/60 overflow-hidden">
            <div className="relative aspect-video bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                {loading ? (
                    <div className="w-full h-full relative">
                        <div className="absolute inset-0 bg-white" />
                        <svg
                            className="w-full h-full animate-pulse text-slate-300"
                            viewBox="0 0 300 168" // 16:9 aspect ratio
                            preserveAspectRatio="none"
                        >
                            {/* Rectangle */}
                            <rect x="20" y="20" rx="4" ry="4" width="80" height="40" fill="currentColor" />
                            {/* Circle */}
                            <circle cx="160" cy="60" r="20" fill="currentColor" />
                            {/* Diamond */}
                            <polygon points="240,40 260,60 240,80 220,60" fill="currentColor" />
                            {/* Line */}
                            <line x1="60" y1="100" x2="240" y2="120" stroke="currentColor" strokeWidth="4" />
                        </svg>
                    </div>
                ) : (
                    <CanvasPreview elements={elements} connections={connections} />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Action buttons overlay */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                    <StarButton isStarred={drawing.isStarred} />
                    <IconButton>
                        <MoreHorizontal className="w-4 h-4 text-slate-600" />
                    </IconButton>
                </div>
            </div>

            <div className="p-4">
                <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                    {drawing.title}
                </h3>

                <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {date}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    {/* Add more footer actions if needed */}
                </div>
            </div>
        </div>
    );
};

export default DrawingCard;