import clsx from "clsx";
import React, { useMemo, useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import type { IconType } from "react-icons";
import SideBarContent from "./SideBarContent";
import SidebarFooter from "./SidebarFooter";
import SidebarMenuItem from "./SidebarMenuItem";
import { SidebarContext, type SidebarContextValue } from "./SideBarContext";


type SidebarSize = "sm" | "md" | "lg" | "xl";
type SidebarHeight = "auto" | "stretch" | "screen" | "sticky";
const sidebarHeights: Record<SidebarHeight, string> = {
    auto: "h-auto",
    stretch: "self-stretch",
    screen: "min-h-screen",
    sticky: "sticky top-0 max-h-screen overflow-y-auto",
};
const sidebarSizes: Record<SidebarSize, string> = {
    sm: "w-56",
    md: "w-72",
    lg: "w-80",
    xl: "w-96",
};

type SidebarProps<T = string> = {
    children?: React.ReactNode
    Icon?: IconType
    width?: SidebarSize;
    height?: SidebarHeight
    defaultOpen?: boolean;
    defaultSelectedItem?: T | null;
};

function SideBarMenuRoot<T = string>({
    width = "md",
    height = "stretch",
    Icon = GiHamburgerMenu,
    defaultOpen = false,
    defaultSelectedItem = null,
    children
}: SidebarProps<T>) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [selectedItem, setSelectedItem] = useState<T | null>(defaultSelectedItem);

    const value = useMemo<SidebarContextValue<T>>(
        () => ({
            isOpen,
            selectedItem,
            setSelectedItem,
            open: () => setIsOpen(true),
            close: () => setIsOpen(false),
            toggle: () => setIsOpen((prev) => !prev),
        }),
        [isOpen, selectedItem]
    );

    return (
        <SidebarContext.Provider value={value as SidebarContextValue<unknown>}>
            <aside
                className={clsx(
                    isOpen ? sidebarSizes[width] : "w-16",
                    sidebarHeights[height],
                    "flex flex-col shrink-0 self-stretch border-l border-border bg-surface text-text shadow-soft transition-all duration-200 ease-in-out"
                )}
            >
                {Icon && (
                    <button
                        type="button"
                        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
                        aria-expanded={isOpen}
                        onClick={value.toggle}
                        className={clsx(
                            "m-3 flex h-10 w-10 items-center justify-center rounded-md border transition-colors duration-150",
                            "focus:outline-none focus:ring-2 focus:ring-accent/60",
                            isOpen
                                ? "border-border-strong bg-surface-strong text-text hover:bg-surface-muted"
                                : "border-transparent bg-accent text-bg hover:bg-accent-strong"
                        )}
                    >
                        <Icon
                            size={22}
                            className={clsx(
                                "transition-transform duration-200",
                                isOpen && "rotate-90"
                            )}
                        />
                    </button>
                )}
                {children}
            </aside>
        </SidebarContext.Provider>
    );
}

const SideBarMenu = Object.assign(SideBarMenuRoot, {
    Content: SideBarContent,
    Footer: SidebarFooter,
    Item: SidebarMenuItem,
});

export default SideBarMenu;
