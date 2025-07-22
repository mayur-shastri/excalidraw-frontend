import React from "react";
import { Save } from "lucide-react";
import IconButton from "../../Buttons/IconButton";
import { useDiagramContext } from "../../../contexts/DiagramContext/DiagramContext";
import { supabase } from "../../../utils/supabaseClient";
import { toast } from "sonner";
import axios from "axios";
import { getItemLocalStorage } from "../../../utils/localStorage";

const SaveButton: React.FC = () => {

    const { currentDiagramId } = useDiagramContext();

    const onClick = async () => {
        if (!currentDiagramId) return;
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
            toast.error(sessionError?.message || 'User not authenticated');
            return;
        }
        const accessToken = session.access_token;
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        const response = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/diagrams/${currentDiagramId}/update`, {
            updatedElements: getItemLocalStorage(`${currentDiagramId}_elements`),
            updatedConnections: getItemLocalStorage(`${currentDiagramId}_connections`),
        });
        if(response.status !== 200){
            toast.error("Failed to save diagram");
        }
        else{
            toast.success("Diagram saved successfully");
        }
    }

    return (
        <IconButton
            onClick={onClick}
            icon={Save}
            title="Save Diagram"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 font-medium shadow-lg transition-all transform hover:scale-105 hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center"
        >
            <Save className="w-5 h-5" />
        </IconButton>
    );
};

export default SaveButton;