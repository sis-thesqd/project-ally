"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { X as CloseIcon, Menu02, SearchRefraction } from "@untitledui/icons";
import {
    Button as AriaButton,
    Dialog as AriaDialog,
    DialogTrigger as AriaDialogTrigger,
    Modal as AriaModal,
    ModalOverlay as AriaModalOverlay,
} from "react-aria-components";
import { UntitledLogo } from "@/components/foundations/logo/untitledui-logo";
import { cx } from "@/utils/cx";

interface MobileNavContextType {
    close: () => void;
}

const MobileNavContext = createContext<MobileNavContextType | null>(null);

export const useMobileNav = () => {
    return useContext(MobileNavContext);
};

// Helper component to close modal on route change
const RouteChangeCloseHandler = ({ onClose }: { onClose: () => void }) => {
    const pathname = usePathname();
    const initialPathRef = useRef(pathname);
    const hasClosedRef = useRef(false);

    useEffect(() => {
        // Close modal when route changes (but not on initial mount)
        if (pathname !== initialPathRef.current && !hasClosedRef.current) {
            hasClosedRef.current = true;
            onClose();
        }
    }, [pathname, onClose]);

    return null;
};

interface MobileNavigationHeaderProps {
    children: ReactNode;
    onSearchClick?: () => void;
}

export const MobileNavigationHeader = ({ children, onSearchClick }: MobileNavigationHeaderProps) => {
    return (
        <AriaDialogTrigger>
            <header className="flex h-16 items-center justify-between border-b border-secondary bg-primary py-3 pr-2 pl-4 lg:hidden">
                <a href="/" className="transition-opacity hover:opacity-80">
                    <img
                        src="/logos/Badge Slanted_Blue-01.svg"
                        alt="MySquad Logo"
                        className="h-10"
                    />
                </a>

                <div className="flex items-center gap-1">
                    {onSearchClick && (
                        <button
                            type="button"
                            onClick={onSearchClick}
                            aria-label="Open search"
                            className="flex items-center justify-center rounded-lg bg-primary p-2 text-fg-secondary outline-focus-ring hover:bg-primary_hover hover:text-fg-secondary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                            <SearchRefraction className="size-6" />
                        </button>
                    )}
                    <AriaButton
                        aria-label="Expand navigation menu"
                        className="group flex items-center justify-center rounded-lg bg-primary p-2 text-fg-secondary outline-focus-ring hover:bg-primary_hover hover:text-fg-secondary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                        <Menu02 className="size-6 transition duration-200 ease-in-out group-aria-expanded:opacity-0" />
                        <CloseIcon className="absolute size-6 opacity-0 transition duration-200 ease-in-out group-aria-expanded:opacity-100" />
                    </AriaButton>
                </div>
            </header>

            <AriaModalOverlay
                isDismissable
                className={({ isEntering, isExiting }) =>
                    cx(
                        "fixed inset-0 z-50 cursor-pointer bg-overlay/70 pr-16 backdrop-blur-md lg:hidden",
                        isEntering && "duration-300 ease-in-out animate-in fade-in",
                        isExiting && "duration-200 ease-in-out animate-out fade-out",
                    )
                }
            >
                {({ state }) => (
                    <>
                        <RouteChangeCloseHandler onClose={() => state.close()} />
                        <AriaButton
                            aria-label="Close navigation menu"
                            onPress={() => state.close()}
                            className="fixed top-3 right-2 flex cursor-pointer items-center justify-center rounded-lg p-2 text-fg-white/70 outline-focus-ring hover:bg-white/10 hover:text-fg-white focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                            <CloseIcon className="size-6" />
                        </AriaButton>

                        <AriaModal className="w-full cursor-auto will-change-transform">
                            <AriaDialog className="h-dvh outline-hidden focus:outline-hidden">
                                <MobileNavContext.Provider value={{ close: () => state.close() }}>
                                    {children}
                                </MobileNavContext.Provider>
                            </AriaDialog>
                        </AriaModal>
                    </>
                )}
            </AriaModalOverlay>
        </AriaDialogTrigger>
    );
};
