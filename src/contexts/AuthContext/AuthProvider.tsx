import { User } from "@supabase/supabase-js";
import { ReactNode, useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();
    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [user]);

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error("Error signing out");
        }
        toast.success("Signed out successfully");
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{ user, handleSignOut }}>
            {children}
        </AuthContext.Provider>
    );
};