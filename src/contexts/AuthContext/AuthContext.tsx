import { createContext, useContext, } from "react";
import type { User } from "@supabase/supabase-js";

type AuthContextType = {
    user: User | null;
    handleSignOut: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuthContext must be used within an AuthProvider');
    return ctx;
};