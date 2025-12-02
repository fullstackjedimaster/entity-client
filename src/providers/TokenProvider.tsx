"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface TokenContextType {
    token: string | null;
    setToken: (t: string | null) => void;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export function TokenProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);

    return (
        <TokenContext.Provider value={{ token, setToken }}>
            {children}
        </TokenContext.Provider>
    );
}

export function useToken() {
    const ctx = useContext(TokenContext);
    if (!ctx) {
        throw new Error("useToken must be used inside TokenProvider");
    }
    return ctx;
}
