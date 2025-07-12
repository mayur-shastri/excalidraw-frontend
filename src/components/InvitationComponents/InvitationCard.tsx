import { Check, X, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Invitation } from "../../types";
import GradientButton from "../Buttons/GradientButton";
import IconButton from "../Buttons/IconButton";

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'ACCEPTED':
            return CheckCircle;
        case 'REJECTED':
            return XCircle;
        case 'EXPIRED':
            return AlertCircle;
        default:
            return Clock;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'ACCEPTED':
            return 'text-green-600 bg-green-50 border-green-200';
        case 'REJECTED':
            return 'text-red-600 bg-red-50 border-red-200';
        case 'EXPIRED':
            return 'text-orange-600 bg-orange-50 border-orange-200';
        default:
            return 'text-blue-600 bg-blue-50 border-blue-200';
    }
};

const InvitationCard: React.FC<{
    invitation: Invitation;
    onAccept: (id: string) => void;
    onReject: (id: string) => void;
}> = ({ invitation, onAccept, onReject }) => {
    const StatusIcon = getStatusIcon(invitation.status);
    return (
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200/60">
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3 className="font-semibold text-lg text-slate-900 mb-2">{invitation.diagram.title}</h3>
                    {/* Inviter Info */}
                    <div className="flex items-center space-x-3 mb-4">
                        <div>
                            <p className="font-medium text-slate-800">{invitation.inviter.name}</p>
                            <p className="text-sm text-slate-500">{invitation.inviter.email}</p>
                        </div>
                    </div>
                    {/* Status Badge */}
                    <div className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full border text-xs font-medium mb-4 ${getStatusColor(invitation.status)}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span className="capitalize">{invitation.status}</span>
                    </div>
                    {/* Timing Info */}
                    <div className="flex items-center space-x-6 text-sm text-slate-500 mb-4">
                        <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Invited {invitation.invitedAt}</span>
                        </div>
                        {invitation.expiresAt && invitation.status === 'PENDING' && (
                            <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>Expires in {invitation.expiresAt}</span>
                            </div>
                        )}
                    </div>
                </div>
                {/* Action Buttons */}
                {invitation.status === 'PENDING' && (
                    <div className="flex items-center space-x-2 ml-4">
                        <IconButton
                            onClick={() => onReject(invitation.id)}
                            title="Reject invitation"
                        >
                            <X className="w-5 h-5" />
                        </IconButton>
                        <GradientButton
                            onClick={() => onAccept(invitation.id)}
                            className="px-4 py-2"
                            icon={Check}
                        >
                            Accept
                        </GradientButton>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvitationCard;
