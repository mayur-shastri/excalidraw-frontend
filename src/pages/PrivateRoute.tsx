import { Navigate} from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Loading from "./Loading";
import { Session } from "@supabase/supabase-js";
export default function PrivateRoute({ children }: { children: JSX.Element }) {

    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSessionFromSupabase = async () => {
            const result = await supabase.auth.getSession();
            setLoading(false);
            if (result.error) {
                console.error("Error fetching session:", result.error.message);
            }
            if (result.data.session) {
                setSession(result.data.session);
            } else {
                return null;
            }
        }
        getSessionFromSupabase();
    }, []);

    if (loading) return <Loading />;
    if (!session) return <Navigate to="/auth" />;

    return children;
}