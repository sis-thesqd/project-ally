"use client";

import React from "react";
import type { FC, HTMLAttributes } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Placement } from "@react-types/overlays";
import { ChevronSelectorVertical, LogOut01, Moon01, RefreshCcw01, Settings01, User01 } from "@untitledui/icons";
import { useFocusManager } from "react-aria";
import type { DialogProps as AriaDialogProps } from "react-aria-components";
import { Button as AriaButton, Dialog as AriaDialog, DialogTrigger as AriaDialogTrigger, Popover as AriaPopover } from "react-aria-components";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { AvatarLabelGroup } from "@/components/base/avatar/avatar-label-group";
import { RadioButtonBase } from "@/components/base/radio-buttons/radio-buttons";
import { Toggle } from "@/components/base/toggle/toggle";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { cx } from "@/utils/cx";

export type AccountItem = {
    account_number: number;
    church_name: string;
};

export type NavAccountType = {
    id: string;
    name: string;
    email: string;
    avatar: string;
    status?: "online" | "offline";
};

const placeholderAccounts: NavAccountType[] = [
    {
        id: "olivia",
        name: "Olivia Rhye",
        email: "olivia@untitledui.com",
        avatar: "https://www.untitledui.com/images/avatars/olivia-rhye?fm=webp&q=80",
        status: "online",
    },
];

export const NavAccountMenu = ({
    className,
    accounts = [],
    selectedAccountNumber,
    onAccountSelect,
    onSettingsClick,
    onRefresh,
    onLogout,
    onThemeChange,
    ...dialogProps
}: AriaDialogProps & {
    className?: string;
    accounts?: AccountItem[];
    selectedAccountNumber?: number;
    onAccountSelect?: (accountNumber: number) => void;
    onSettingsClick?: () => void;
    onRefresh?: () => void;
    onLogout?: () => void;
    onThemeChange?: (isDark: boolean) => void;
}) => {
    const focusManager = useFocusManager();
    const dialogRef = useRef<HTMLDivElement>(null);
    const { theme, setTheme } = useTheme();
    const isDarkMode = theme === 'dark';

    const handleThemeToggle = (isDark: boolean) => {
        setTheme(isDark ? 'dark' : 'light');
        onThemeChange?.(isDark);
    };

    const onKeyDown = useCallback(
        (e: KeyboardEvent) => {
            switch (e.key) {
                case "ArrowDown":
                    focusManager?.focusNext({ tabbable: true, wrap: true });
                    break;
                case "ArrowUp":
                    focusManager?.focusPrevious({ tabbable: true, wrap: true });
                    break;
            }
        },
        [focusManager],
    );

    useEffect(() => {
        const element = dialogRef.current;
        if (element) {
            element.addEventListener("keydown", onKeyDown);
        }

        return () => {
            if (element) {
                element.removeEventListener("keydown", onKeyDown);
            }
        };
    }, [onKeyDown]);

    return (
        <>
            <AriaDialog
                {...dialogProps}
                ref={dialogRef}
                className={cx("w-66 rounded-xl bg-secondary_alt shadow-lg ring ring-secondary_alt outline-hidden", className)}
            >
                <div className="rounded-xl bg-primary ring-1 ring-secondary">
                    {/* Account list */}
                    {accounts.length > 0 && (
                        <div className="flex flex-col gap-2 p-3">
                            {accounts.map((account) => (
                                <label
                                    key={account.account_number}
                                    className={cx(
                                        "group flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors",
                                        selectedAccountNumber === account.account_number ? "bg-secondary" : "hover:bg-primary_hover",
                                    )}
                                    onClick={() => onAccountSelect?.(account.account_number)}
                                >
                                    <RadioButtonBase
                                        size="md"
                                        isSelected={selectedAccountNumber === account.account_number}
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-primary">{account.church_name}</span>
                                        <span className="text-xs text-tertiary">Account #{account.account_number}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}

                    {/* Menu items */}
                    <div className={cx("flex flex-col gap-0.5 py-1.5", accounts.length > 0 && "border-t border-secondary")}>
                        <NavAccountCardMenuItem
                            label="Settings"
                            icon={Settings01}
                            shortcut="⌘S"
                            onClick={onSettingsClick}
                        />
                        <div className="group/item w-full px-1.5">
                            <div className="flex w-full items-center justify-between gap-3 rounded-md p-2">
                                <div className="flex gap-2 text-sm font-semibold text-secondary">
                                    <Moon01 className="size-5 text-fg-quaternary" /> Dark mode
                                </div>
                                <Toggle
                                    size="sm"
                                    isSelected={isDarkMode}
                                    onChange={handleThemeToggle}
                                />
                            </div>
                        </div>
                        <NavAccountCardMenuItem
                            label="Refresh data"
                            icon={RefreshCcw01}
                            onClick={onRefresh}
                        />
                    </div>
                </div>

                {/* Bottom section */}
                <div className="pt-1 pb-1.5">
                    <NavAccountCardMenuItem label="Log out" icon={LogOut01} shortcut="⌥⇧Q" onClick={onLogout} />
                </div>
            </AriaDialog>
        </>
    );
};

const NavAccountCardMenuItem = ({
    icon: Icon,
    label,
    shortcut,
    ...buttonProps
}: {
    icon?: FC<{ className?: string }>;
    label: string;
    shortcut?: string;
} & HTMLAttributes<HTMLButtonElement>) => {
    return (
        <button {...buttonProps} className={cx("group/item w-full cursor-pointer px-1.5 focus:outline-hidden", buttonProps.className)}>
            <div
                className={cx(
                    "flex w-full items-center justify-between gap-3 rounded-md p-2 group-hover/item:bg-primary_hover",
                    // Focus styles.
                    "outline-focus-ring group-focus-visible/item:outline-2 group-focus-visible/item:outline-offset-2",
                )}
            >
                <div className="flex gap-2 text-sm font-semibold text-secondary group-hover/item:text-secondary_hover">
                    {Icon && <Icon className="size-5 text-fg-quaternary" />} {label}
                </div>

                {shortcut && (
                    <kbd className="flex rounded px-1 py-px font-body text-xs font-medium text-tertiary ring-1 ring-secondary ring-inset">{shortcut}</kbd>
                )}
            </div>
        </button>
    );
};

export const NavAccountCard = ({
    popoverPlacement,
    selectedAccountId = "olivia",
    items = placeholderAccounts,
}: {
    popoverPlacement?: Placement;
    selectedAccountId?: string;
    items?: NavAccountType[];
}) => {
    const triggerRef = useRef<HTMLDivElement>(null);
    const isDesktop = useBreakpoint("lg");
    const router = useRouter();
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const selectedAccount = placeholderAccounts.find((account) => account.id === selectedAccountId);

    const handleSettingsClick = () => {
        setIsPopoverOpen(false);
        router.push("/settings");
    };

    if (!selectedAccount) {
        console.warn(`Account with ID ${selectedAccountId} not found in <NavAccountCard />`);
        return null;
    }

    return (
        <div ref={triggerRef} className="relative flex items-center gap-3 rounded-xl p-3 ring-1 ring-secondary ring-inset">
            <AvatarLabelGroup
                size="md"
                src={selectedAccount.avatar}
                title={selectedAccount.name}
                subtitle={selectedAccount.email}
                status={selectedAccount.status}
            />

            <div className="absolute top-1.5 right-1.5">
                <AriaDialogTrigger isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <AriaButton className="flex cursor-pointer items-center justify-center rounded-md p-1.5 text-fg-quaternary outline-focus-ring transition duration-100 ease-linear hover:bg-primary_hover hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-2 pressed:bg-primary_hover pressed:text-fg-quaternary_hover">
                        <ChevronSelectorVertical className="size-4 shrink-0" />
                    </AriaButton>
                    <AriaPopover
                        placement={popoverPlacement ?? (isDesktop ? "right bottom" : "top right")}
                        triggerRef={triggerRef}
                        offset={8}
                        className={({ isEntering, isExiting }) =>
                            cx(
                                "z-40 origin-(--trigger-anchor-point) will-change-transform",
                                isEntering &&
                                    "duration-150 ease-out animate-in fade-in placement-right:slide-in-from-left-0.5 placement-top:slide-in-from-bottom-0.5 placement-bottom:slide-in-from-top-0.5",
                                isExiting &&
                                    "duration-100 ease-in animate-out fade-out placement-right:slide-out-to-left-0.5 placement-top:slide-out-to-bottom-0.5 placement-bottom:slide-out-to-top-0.5",
                            )
                        }
                    >
                        <NavAccountMenu onSettingsClick={handleSettingsClick} />
                    </AriaPopover>
                </AriaDialogTrigger>
            </div>
        </div>
    );
};
