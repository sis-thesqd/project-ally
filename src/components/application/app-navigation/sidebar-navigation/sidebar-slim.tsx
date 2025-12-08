"use client";

import React from "react";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { LogOut01, Moon01, Plus, Settings01 } from "@untitledui/icons";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Button as AriaButton, DialogTrigger as AriaDialogTrigger, Popover as AriaPopover } from "react-aria-components";
import { Avatar } from "@/components/base/avatar/avatar";
import { AvatarLabelGroup } from "@/components/base/avatar/avatar-label-group";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Toggle } from "@/components/base/toggle/toggle";
import { UntitledLogo } from "@/components/foundations/logo/untitledui-logo";
import { cx } from "@/utils/cx";
import { cache } from "@/utils/cache";
import { MobileNavigationHeader } from "../base-components/mobile-header";
import { NavAccountMenu, type AccountItem } from "../base-components/nav-account-card";
import { NavItemBase } from "../base-components/nav-item";
import { NavItemButton } from "../base-components/nav-item-button";
import { NavList } from "../base-components/nav-list";
import { CreateNewButton } from "../base-components/create-new-button";
import { LoadingOverlay } from "@/components/application/loading-overlay/loading-overlay";
import type { NavItemType } from "../config";
import { useInitData } from "@/contexts/InitDataContext";

interface SidebarNavigationSlimProps {
    /** URL of the currently active item. */
    activeUrl?: string;
    /** List of items to display. */
    items: (NavItemType & { icon: FC<{ className?: string }> })[];
    /** List of footer items to display. */
    footerItems?: (NavItemType & { icon: FC<{ className?: string }> })[];
    /** Whether to hide the border. */
    hideBorder?: boolean;
    /** Whether to hide the right side border. */
    hideRightBorder?: boolean;
}

// Get initials from first two words of a name
function getInitials(name: string | null | undefined): string {
    if (!name) return '';
    const words = name.trim().split(/\s+/);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}

export const SidebarNavigationSlim = ({ activeUrl, items, footerItems = [], hideBorder, hideRightBorder }: SidebarNavigationSlimProps) => {
    const { data, updatePreferences, refreshData } = useInitData();
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const isDarkMode = theme === 'dark';
    const accounts = data?.accounts ?? [];
    const preferences = data?.preferences;
    const userName = data?.name ?? data?.username ?? 'User';
    const userEmail = data?.email ?? '';
    const profilePicture = data?.profile_picture ?? undefined;
    const userInitials = getInitials(data?.username ?? data?.name);

    // Get default account from preferences, fallback to first account
    const defaultAccount = preferences?.default_account ?? accounts[0]?.account_number;

    const activeItem = [...items, ...footerItems].find((item) => item.href === activeUrl || item.items?.some((subItem) => subItem.href === activeUrl));
    const [currentItem, setCurrentItem] = useState(activeItem || items[0] || null);
    const [isHovering, setIsHovering] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [selectedAccountNumber, setSelectedAccountNumber] = useState<number | undefined>(undefined);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const accountInitialized = useRef(false);

    // Set default account from preferences when data loads
    useEffect(() => {
        if (defaultAccount !== undefined && !accountInitialized.current) {
            setSelectedAccountNumber(defaultAccount);
            accountInitialized.current = true;
        }
    }, [defaultAccount]);

    const handleSettingsClick = () => {
        setIsPopoverOpen(false);
        router.push("/settings");
    };

    const handleAccountSelect = (accountNumber: number) => {
        setSelectedAccountNumber(accountNumber);
        setIsPopoverOpen(false);
        // Persist to database
        updatePreferences({ default_account: accountNumber });
    };

    const handleThemeChange = (isDark: boolean) => {
        const newTheme = isDark ? 'dark' : 'light';
        setTheme(newTheme);
        // Persist to database
        updatePreferences({ default_theme: newTheme });
    };

    const handleLogout = async () => {
        setIsPopoverOpen(false);
        // Submit to the signout route handler
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "/auth/signout";
        document.body.appendChild(form);
        form.submit();
    };

    const handleRefresh = async () => {
        setIsPopoverOpen(false);
        setIsRefreshing(true);

        try {
            // Clear localStorage cache for task-stats and account-stats
            // These are keyed by account number, so clear all potential keys
            for (const account of accounts) {
                cache.remove(`task-stats-${account.account_number}`);
                cache.remove(`account-stats-${account.account_number}`);
            }

            // Refresh the init data (pa_init RPC)
            await refreshData();

            // Force a page reload to refresh the charts
            window.location.reload();
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const isSecondarySidebarVisible = isHovering && Boolean(currentItem?.items?.length);

    const MAIN_SIDEBAR_WIDTH = 68;
    const SECONDARY_SIDEBAR_WIDTH = 268;

    const mainSidebar = (
        <aside
            style={{
                width: MAIN_SIDEBAR_WIDTH,
            }}
            className={cx(
                "group flex h-full max-h-full max-w-full overflow-y-auto py-1 pl-1 transition duration-100 ease-linear",
                isSecondarySidebarVisible && "bg-primary",
            )}
        >
            <div
                className={cx(
                    "flex w-auto flex-col justify-between rounded-xl bg-primary pt-5 ring-1 ring-secondary transition duration-300 ring-inset",
                    hideBorder && !isSecondarySidebarVisible && "ring-transparent",
                )}
            >
                <div className="flex justify-center px-3">
                    <a href="/" className="transition-opacity hover:opacity-80">
                        <img
                            src="/logos/Badge Slanted_Blue-01.svg"
                            alt="Logo"
                            className="h-8"
                        />
                    </a>
                </div>

                <div className="mt-4 flex justify-center px-3">
                    <CreateNewButton
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 transition-colors hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <Plus className="h-5 w-5 text-gray-100" />
                    </CreateNewButton>
                </div>

                <ul className="mt-4 flex flex-col gap-0.5 px-3">
                    {items.map((item) => (
                        <li key={item.label}>
                            <NavItemButton
                                size="md"
                                current={currentItem?.href === item.href}
                                href={item.href}
                                label={item.label || ""}
                                icon={item.icon}
                                onClick={() => setCurrentItem(item)}
                            />
                        </li>
                    ))}
                </ul>
                <div className="mt-auto flex flex-col gap-4 px-3 py-5">
                    {footerItems.length > 0 && (
                        <ul className="flex flex-col gap-0.5">
                            {footerItems.map((item) => (
                                <li key={item.label}>
                                    <NavItemButton
                                        size="md"
                                        current={currentItem?.href === item.href}
                                        label={item.label || ""}
                                        href={item.href}
                                        icon={item.icon}
                                        onClick={() => setCurrentItem(item)}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}

                    <AriaDialogTrigger isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                        <AriaButton
                            className={({ isPressed, isFocused }) =>
                                cx("group relative inline-flex rounded-full", (isPressed || isFocused) && "outline-2 outline-offset-2 outline-focus-ring")
                            }
                        >
                            <Avatar src={profilePicture} initials={userInitials} size="md" alt={userName} />
                        </AriaButton>
                        <AriaPopover
                            placement="right bottom"
                            offset={8}
                            crossOffset={6}
                            className={({ isEntering, isExiting }) =>
                                cx(
                                    "z-40 will-change-transform",
                                    isEntering &&
                                        "duration-300 ease-out animate-in fade-in placement-right:slide-in-from-left-2 placement-top:slide-in-from-bottom-2 placement-bottom:slide-in-from-top-2",
                                    isExiting &&
                                        "duration-150 ease-in animate-out fade-out placement-right:slide-out-to-left-2 placement-top:slide-out-to-bottom-2 placement-bottom:slide-out-to-top-2",
                                )
                            }
                        >
                            <NavAccountMenu
                                accounts={accounts}
                                selectedAccountNumber={selectedAccountNumber}
                                onAccountSelect={handleAccountSelect}
                                onSettingsClick={handleSettingsClick}
                                onRefresh={handleRefresh}
                                onLogout={handleLogout}
                                onThemeChange={handleThemeChange}
                            />
                        </AriaPopover>
                    </AriaDialogTrigger>
                </div>
            </div>
        </aside>
    );

    const secondarySidebar = (
        <AnimatePresence initial={false}>
            {isSecondarySidebarVisible && (
                <motion.div
                    initial={{ width: 0, borderColor: "var(--color-border-secondary)" }}
                    animate={{ width: SECONDARY_SIDEBAR_WIDTH, borderColor: "var(--color-border-secondary)" }}
                    exit={{ width: 0, borderColor: "rgba(0,0,0,0)", transition: { borderColor: { type: "tween", delay: 0.05 } } }}
                    transition={{ type: "spring", damping: 26, stiffness: 220, bounce: 0 }}
                    className={cx(
                        "relative h-full overflow-x-hidden overflow-y-auto bg-primary",
                        !(hideBorder || hideRightBorder) && "box-content border-r-[1.5px]",
                    )}
                >
                    <div style={{ width: SECONDARY_SIDEBAR_WIDTH }} className="flex h-full flex-col px-4 pt-6">
                        <h3 className="text-sm font-semibold text-brand-secondary">{currentItem?.label}</h3>
                        <ul className="py-2">
                            {currentItem?.items?.map((item) => (
                                <li key={item.label} className="py-0.5">
                                    <NavItemBase current={activeUrl === item.href} href={item.href} icon={item.icon} badge={item.badge} type="link">
                                        {item.label}
                                    </NavItemBase>
                                </li>
                            ))}
                        </ul>
                        <div className="sticky bottom-0 mt-auto flex justify-between border-t border-secondary bg-primary px-2 py-5">
                            <div>
                                <p className="text-sm font-semibold text-primary">{userName}</p>
                                <p className="text-sm text-tertiary">{userEmail}</p>
                            </div>
                            <div className="absolute top-2.5 right-0">
                                <ButtonUtility size="sm" color="tertiary" tooltip="Log out" icon={LogOut01} onClick={handleLogout} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            <LoadingOverlay isVisible={isRefreshing} label="Refreshing..." />

            {/* Desktop sidebar navigation */}
            <div
                className="z-50 hidden lg:fixed lg:bottom-0 lg:left-0 lg:flex"
                style={{ top: "var(--global-banner-height, 0px)" }}
                onPointerEnter={() => setIsHovering(true)}
                onPointerLeave={() => setIsHovering(false)}
            >
                {mainSidebar}
                {secondarySidebar}
            </div>

            {/* Placeholder to take up physical space because the real sidebar has `fixed` position. */}
            <div
                style={{
                    paddingLeft: MAIN_SIDEBAR_WIDTH,
                }}
                className="invisible hidden lg:sticky lg:top-0 lg:bottom-0 lg:left-0 lg:block"
            />

            {/* Mobile header navigation */}
            <MobileNavigationHeader>
                <aside className="group flex h-full max-h-full w-full max-w-full flex-col justify-between overflow-y-auto bg-primary pt-4">
                    <div className="px-4">
                        <a href="/" className="inline-block transition-opacity hover:opacity-80">
                            <img src="/logos/Badge Slanted_Blue-01.svg" alt="Logo" className="h-10" />
                        </a>
                    </div>

                    <div className="mt-4 px-4">
                        <CreateNewButton
                            className="flex w-full items-center gap-3 rounded-lg bg-gray-800 px-3 py-2.5 transition-colors hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <Plus className="h-5 w-5 text-gray-100" />
                            <span className="text-sm font-medium text-gray-100">Create New</span>
                        </CreateNewButton>
                    </div>

                    <NavList items={items} />

                    <div className="mt-auto flex flex-col gap-5 px-2 py-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between rounded-md px-3 py-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-md font-semibold text-secondary">Dark mode</span>
                                </div>
                                <Toggle
                                    size="sm"
                                    isSelected={isDarkMode}
                                    onChange={handleThemeChange}
                                />
                            </div>
                            <NavItemBase type="link" href="/settings">
                                Settings
                            </NavItemBase>
                        </div>

                        <div className="relative flex items-center gap-3 border-t border-secondary pt-6 pr-8 pl-2">
                            <AvatarLabelGroup
                                status="online"
                                size="md"
                                src={profilePicture}
                                initials={userInitials}
                                title={userName}
                                subtitle={userEmail}
                            />

                            <div className="absolute top-1/2 right-0 -translate-y-1/2">
                                <Button
                                    size="sm"
                                    color="tertiary"
                                    iconLeading={<LogOut01 className="size-5 text-fg-quaternary transition-inherit-all group-hover:text-fg-quaternary_hover" />}
                                    className="p-1.5!"
                                    onClick={handleLogout}
                                />
                            </div>
                        </div>
                    </div>
                </aside>
            </MobileNavigationHeader>
        </>
    );
};
