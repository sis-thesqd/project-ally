"use client";

import React from "react";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { LogOut01, Moon01, Plus, RefreshCcw01, Settings01, SearchLg, ZapFast, User01, Mail01, Image01, Map01, Box, BarChart03, BarChart12, Sun } from "@untitledui/icons";
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
import { useHotkeys } from "react-hotkeys-hook";
import { Heading as AriaHeading } from "react-aria-components";
import type { CommandDropdownMenuItemProps } from "@/components/application/command-menus/base-components/command-menu-item";
import { CommandMenu } from "@/components/application/command-menus/command-menu";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { settingsConfig } from "@/config";

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
    const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
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

    // Keyboard shortcut for command menu
    useHotkeys('shift+k', (e) => {
        e.preventDefault();
        setIsCommandMenuOpen(true);
    }, { enableOnFormTags: true });

    // Icon mapping
    const iconMap: Record<string, FC<{ className?: string }>> = {
        User01,
        Mail01,
        Image01,
        Map01,
        Settings01,
        Plus,
        Box,
        BarChart03,
        BarChart12,
    };

    // Prepare command menu items
    const commandMenuItems: CommandDropdownMenuItemProps[] = settingsConfig.commandMenuItems.map((item) => ({
        id: item.id,
        type: "icon",
        label: item.label,
        icon: iconMap[item.icon] || SearchLg,
        size: "sm",
        description: item.description,
        stacked: true,
    }));

    const commandMenuGroups = [
        { id: "actions", title: "Quick Actions", items: commandMenuItems.filter(i => ['create', 'projects'].includes(i.id)) },
        { id: "stats", title: "Stats", items: commandMenuItems.filter(i => ['stats-weekly', 'stats-monthly'].includes(i.id)) },
        { id: "settings", title: "Settings", items: commandMenuItems.filter(i => !['create', 'projects', 'stats-weekly', 'stats-monthly'].includes(i.id)) },
    ];

    const handleCommandMenuSelection = async (keys: any) => {
        // Handle both Set and single key
        let selectedKey: string;
        if (keys instanceof Set) {
            const keyArray = Array.from(keys);
            if (keyArray.length === 0) return;
            selectedKey = keyArray[0].toString();
        } else {
            selectedKey = keys.toString();
        }
        
        console.log('Selected key:', selectedKey);
        const item = settingsConfig.commandMenuItems.find(s => s.id === selectedKey);
        console.log('Found item:', item);
        
        if (!item) return;
        
        setIsCommandMenuOpen(false);
        
        // Check for special actions (chart period)
        if ('action' in item && item.action === 'setChartPeriod' && 'chartPeriod' in item) {
            console.log('Setting chart period to:', item.chartPeriod);
            // Update chart period preference behind the scenes
            await updatePreferences({ chart_period: item.chartPeriod as 'weekly' | 'monthly' });
            // Navigate to dashboard (clean URL)
            router.push('/');
        }
        // Check if it's a direct href
        else if ('href' in item && item.href) {
            console.log('Navigating to href:', item.href);
            router.push(item.href);
        }
        // Check if it's a settings item
        else if ('tab' in item && 'sectionId' in item) {
            console.log('Navigating to settings section:', item.sectionId);
            
            // Check if we're already on the settings page
            const isOnSettings = window.location.pathname === '/settings';
            
            if (isOnSettings) {
                // Trigger focus directly without navigation
                window.dispatchEvent(new CustomEvent('settings-focus', {
                    detail: {
                        sectionId: item.sectionId,
                        tab: item.tab,
                    }
                }));
            } else {
                // Store focus info in sessionStorage (temporary, only for this navigation)
                sessionStorage.setItem('settings_focus', JSON.stringify({
                    sectionId: item.sectionId,
                    tab: item.tab,
                }));
                // Navigate to settings (clean URL)
                router.push('/settings');
            }
        }
    };

    // Prefetch common routes for faster navigation
    useEffect(() => {
        router.prefetch('/create');
        router.prefetch('/projects');
        router.prefetch('/settings');
    }, [router]);

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

                    {/* Command menu button - Desktop only */}
                    <button
                        type="button"
                        onClick={() => setIsCommandMenuOpen(true)}
                        className="hidden lg:flex flex-col items-center justify-center gap-1 w-full py-3 rounded-lg text-fg-quaternary hover:bg-primary_hover hover:text-fg-quaternary_hover transition-colors"
                        aria-label="Command menu"
                    >
                        <span className="text-[12px] font-medium text-quaternary">⇧K</span>
                    </button>

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

            {/* Command Menu */}
            <CommandMenu
                isOpen={isCommandMenuOpen}
                items={commandMenuGroups}
                onOpenChange={setIsCommandMenuOpen}
                onSelectionChange={handleCommandMenuSelection}
                shortcut={null}
                overlayClassName="flex items-center justify-center p-4"
                emptyState={
                    <EmptyState size="sm" className="overflow-hidden p-6 pb-10">
                        <EmptyState.Header>
                            <EmptyState.FeaturedIcon color="gray" />
                        </EmptyState.Header>
                        <EmptyState.Content className="mb-0">
                            <EmptyState.Title>No settings found</EmptyState.Title>
                            <EmptyState.Description>
                                Your search did not match any settings. <br />
                                Please try again.
                            </EmptyState.Description>
                        </EmptyState.Content>
                    </EmptyState>
                }
            >
                <AriaHeading slot="title" className="sr-only">
                    Settings
                </AriaHeading>
                <CommandMenu.Group>
                    <CommandMenu.List className="min-h-49">
                        {(group) => <CommandMenu.Section {...group}>{(item) => <CommandMenu.Item key={item.id} {...item} />}</CommandMenu.Section>}
                    </CommandMenu.List>
                </CommandMenu.Group>
                {/* Custom controls section */}
                <div className="border-t border-secondary px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                setIsCommandMenuOpen(false);
                                handleRefresh();
                            }}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-secondary hover:bg-primary_hover hover:text-primary transition-colors"
                        >
                            <RefreshCcw01 className="size-4" />
                            Refresh data
                        </button>
                        <div className="flex items-center gap-2">
                            <Sun className="size-4 text-tertiary" />
                            <Toggle
                                size="sm"
                                isSelected={isDarkMode}
                                onChange={handleThemeChange}
                            />
                            <Moon01 className="size-4 text-tertiary" />
                        </div>
                    </div>
                </div>
            </CommandMenu>

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
            <MobileNavigationHeader onSearchClick={() => setIsCommandMenuOpen(true)}>
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

                    <div className="mt-auto flex flex-col gap-5 px-2 pb-8 pt-4">
                        <div className="relative flex items-center gap-3 border-t border-secondary pt-6 pr-12 pl-2">
                            <AvatarLabelGroup
                                status="online"
                                size="md"
                                src={profilePicture}
                                initials={userInitials}
                                title={userName}
                                subtitle={userEmail}
                            />
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg p-2 text-fg-quaternary outline-focus-ring transition hover:bg-primary_hover hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
                            >
                                <LogOut01 className="size-5" />
                            </button>
                        </div>
                    </div>
                </aside>
            </MobileNavigationHeader>
        </>
    );
};
