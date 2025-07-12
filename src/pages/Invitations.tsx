// import React, { useEffect, useState } from 'react';
// import Header from '../components/InvitationComponents/Header';
// import AnimatedBackground from '../components/InvitationComponents/AnimatedBackground';
// import Tabs from '../components/InvitationComponents/Tabs';
// import { Invitation } from '../types';
// import EmptyState from '../components/InvitationComponents/EmptyState';
// import InvitationCard from '../components/InvitationComponents/InvitationCard';
// import axios from 'axios';
// import { toast } from 'sonner';
// import { supabase } from '../utils/supabaseClient';
// import { useNavigate } from 'react-router-dom';

// const Invitations: React.FC = () => {
//     const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'rejected' | 'all'>('pending');
//     const [invitations, setInvitations] = useState<Invitation[]>([]);
//     const [loading, setLoading] = useState(true);

//     const navigate = useNavigate();



//     const fetchInvitations = async (tab: typeof activeTab) => {
//         setLoading(true);
//         try {
//             const { data: { session }, error: sessionError } = await supabase.auth.getSession();
//             if (sessionError || !session) {
//                 toast.error(sessionError?.message || 'User not authenticated');
//                 return;
//             }
//             const accessToken = session.access_token;
//             axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

//             if (tab === 'all') {
//                 const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/invitations/all-user-invitations`);
//                 setInvitations(res.data.invitations);
//             } else {
//                 const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/invitations/filter-user-invitations`, {
//                     params: { status: tab.toUpperCase() }
//                 });
//                 setInvitations(res.data.invitations);
//             }
//         } catch (err) {
//             console.error('Failed to fetch invitations:', err);
//             toast.error('Failed to load invitations');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchInvitations(activeTab);
//     }, [activeTab]);

//     const updateInvitationStatus = async (invitationId: string, accept: boolean) => {
//         try {
//             const { data: { session }, error: sessionError } = await supabase.auth.getSession();
//             if (sessionError || !session) {
//                 toast.error(sessionError?.message || 'User not authenticated');
//                 return;
//             }
//             const accessToken = session.access_token;
//             axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
//             await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/invitations/update-invitation-status`, {
//                 invitationId,
//                 accept,
//             });
//             toast.success(`Invitation ${accept ? 'accepted' : 'rejected'}`);
//             fetchInvitations(activeTab); // re-fetch current tab's data
//         } catch (error) {
//             console.error('Failed to update invitation:', error);
//             toast.error('Failed to update invitation');
//         }
//     };

//     const onGoBack = () => {
//         navigate(-1);
//     };

//     const pendingCount = invitations.filter(inv => inv.status === 'pending').length;

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
//             <AnimatedBackground />
//             <Header onGoBack={onGoBack} pendingCount={pendingCount} />
//             <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//                 {/* Tabs */}
//                 <div className="mb-8">
//                     <Tabs activeTab={activeTab} setActiveTab={setActiveTab} invitations={invitations} />
//                 </div>

//                 {/* Invitations List */}
//                 <div className="space-y-4">
//                     {loading ? (
//                         <div className="text-center text-gray-500">Loading invitations...</div>
//                     ) : invitations.length === 0 ? (
//                         <EmptyState searchQuery="" selectedFilter={activeTab} />
//                     ) : (
//                         invitations.map(invitation => (
//                             <InvitationCard
//                                 key={invitation.id}
//                                 invitation={invitation}
//                                 onAccept={() => updateInvitationStatus(invitation.id, true)}
//                                 onReject={() => updateInvitationStatus(invitation.id, false)}
//                             />
//                         ))
//                     )}
//                 </div>
//             </main>
//         </div>
//     );
// };

// export default Invitations;

import React, { useEffect, useState } from 'react';
import Header from '../components/InvitationComponents/Header';
import AnimatedBackground from '../components/InvitationComponents/AnimatedBackground';
import Tabs from '../components/InvitationComponents/Tabs';
import { Invitation } from '../types';
import EmptyState from '../components/InvitationComponents/EmptyState';
import InvitationCard from '../components/InvitationComponents/InvitationCard';
import axios from 'axios';
import { toast } from 'sonner';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';

type InvitationCount = {
    countPending: number;
    countAccepted: number;
    countRejected: number;
    countAll: number;
};

const Invitations: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'rejected' | 'all'>('pending');
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [invitationCounts, setInvitationCounts] = useState<InvitationCount>({
        countPending: 0,
        countAccepted: 0,
        countRejected: 0,
        countAll: 0,
    });
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const fetchInvitationCounts = async () => {
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) {
                toast.error(sessionError?.message || 'User not authenticated');
                return;
            }
            const accessToken = session.access_token;
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/invitations/count`);
            setInvitationCounts(res.data.counts);
        } catch (err) {
            console.error('Failed to fetch invitation counts:', err);
            toast.error('Failed to load invitation counts');
        }
    };

    const fetchInvitations = async (tab: typeof activeTab) => {
        setLoading(true);
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) {
                toast.error(sessionError?.message || 'User not authenticated');
                return;
            }
            const accessToken = session.access_token;
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            const endpoint = tab === 'all'
                ? `/invitations/all-user-invitations`
                : `/invitations/filter-user-invitations`;

            const config = tab === 'all' ? {} : { params: { status: tab.toUpperCase() } };
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`, config);
            setInvitations(res.data.invitations);
        } catch (err) {
            console.error('Failed to fetch invitations:', err);
            toast.error('Failed to load invitations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvitations(activeTab);
        fetchInvitationCounts();
    }, [activeTab]);

    const updateInvitationStatus = async (invitationId: string, accept: boolean) => {
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) {
                toast.error(sessionError?.message || 'User not authenticated');
                return;
            }
            const accessToken = session.access_token;
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/invitations/update-invitation-status`, {
                invitationId,
                accept,
            });

            toast.success(`Invitation ${accept ? 'accepted' : 'rejected'}`);
            fetchInvitations(activeTab);
            fetchInvitationCounts();
        } catch (error) {
            console.error('Failed to update invitation:', error);
            toast.error('Failed to update invitation');
        }
    };

    const onGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
            <AnimatedBackground />
            <Header onGoBack={onGoBack} pendingCount={invitationCounts.countPending} />
            <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="mb-8">
                    <Tabs
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        counts={invitationCounts}
                    />
                </div>

                {/* Invitations List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center text-gray-500">Loading invitations...</div>
                    ) : invitations.length === 0 ? (
                        <EmptyState searchQuery="" selectedFilter={activeTab} />
                    ) : (
                        invitations.map(invitation => (
                            <InvitationCard
                                key={invitation.id}
                                invitation={invitation}
                                onAccept={() => updateInvitationStatus(invitation.id, true)}
                                onReject={() => updateInvitationStatus(invitation.id, false)}
                            />
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default Invitations;