import React, { useState } from "react";
import { UserPlus, X } from "lucide-react";
import axios from "axios";
import { supabase } from "../../../utils/supabaseClient";
import { toast } from "sonner";
import GradientButton from "../../Buttons/GradientButton";
import IconButton from "../../Buttons/IconButton";
import { useDiagramContext } from "../../../contexts/DiagramContext/DiagramContext";

const accessLevels = [
    { value: "VIEW", label: "Viewer" },
    { value: "EDIT", label: "Editor" },
];

const InviteButton: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [email, setEmail] = useState("");
    const [access, setAccess] = useState("view");
    const [sending, setSending] = useState(false);

    const {currentDiagramId} = useDiagramContext();

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) {
                toast.error(sessionError?.message || "User not authenticated");
                setSending(false);
                return;
            }
            const accessToken = session.access_token;
            axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/invitations/invite`, {
                diagramId : currentDiagramId,
                email,
                access,
            });
            toast.success("Invitation sent!");
            setShowModal(false);
            setEmail("");
            setAccess("VIEW");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to send invite");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="">
            <IconButton
                onClick={() => setShowModal(true)}
                icon={UserPlus}
                title="Invite collaborators"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 font-medium shadow-lg transition-all transform hover:scale-105 hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center"
            >
                <UserPlus className="w-5 h-5" />
            </IconButton>
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm relative">
                        <button
                            className="absolute top-2 right-2 text-slate-400 hover:text-slate-700"
                            onClick={() => setShowModal(false)}
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-lg font-semibold mb-4">Invite to Collaborate</h2>
                        <form onSubmit={handleInvite} className="space-y-4">
                            <input
                                type="email"
                                className="w-full border rounded px-3 py-2"
                                placeholder="Enter email address"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                            <select
                                className="w-full border rounded px-3 py-2"
                                value={access}
                                onChange={e => setAccess(e.target.value)}
                                required
                            >
                                {accessLevels.map(level => (
                                    <option key={level.value} value={level.value}>
                                        {level.label}
                                    </option>
                                ))}
                            </select>
                            <GradientButton
                                type="submit"
                                className="w-full"
                                disabled={sending}
                            >
                                {sending ? "Sending..." : "Send Invite"}
                            </GradientButton>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InviteButton;