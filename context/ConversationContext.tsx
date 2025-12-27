"use client";

import { createContext, useState, ReactNode } from "react";

interface ConversationContextType {
    activeId: string | null;
    setActiveId: (id: string | null) => void;
}

export const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const ConversationProvider = ({ children }: { children: ReactNode }) => {
    const [activeId, setActiveId] = useState<string | null>(null);

    return (
        <ConversationContext.Provider value={{ activeId, setActiveId }}>
            {children}
        </ConversationContext.Provider>
    );
};