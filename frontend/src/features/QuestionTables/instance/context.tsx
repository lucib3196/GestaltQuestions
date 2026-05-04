import { createContext, useContext, useRef, type ReactNode } from "react";
import { useStore } from "zustand";
import type { StoreApi } from "zustand";
import { createDevQuestionTStore } from "./store";
import type { DevQuestionTStore, DevQuestionTState } from "./types";

const DevTableContext = createContext<StoreApi<DevQuestionTStore> | null>(null);

export function DevTableProvider({
    children,
    initialState,
}: {
    children: ReactNode;
    initialState?: Partial<DevQuestionTState>;
}) {
    const storeRef = useRef<StoreApi<DevQuestionTStore> | null>(null);

    if (!storeRef.current) {
        storeRef.current = createDevQuestionTStore(initialState);
    }
    return (
        <DevTableContext.Provider value={storeRef.current}>
            {children}
        </DevTableContext.Provider>
    );
}

export function useDevTableContext<T>(
    selector: (state: DevQuestionTStore) => T,
): T {
    const store = useContext(DevTableContext);
    if (!store)
        throw new Error("useDevTableContext must be used within DevTableProvider");
    return useStore(store, selector);
}
