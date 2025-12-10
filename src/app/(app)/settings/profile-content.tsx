"use client";

import { useEffect, useState, useMemo } from "react";
import { Mail01 } from "@untitledui/icons";
import TimezoneSelect from "react-timezone-select";
import { SectionHeader } from "@/components/application/section-headers/section-headers";
import { SectionLabel } from "@/components/application/section-headers/section-label";
import { Avatar } from "@/components/base/avatar/avatar";
import { Form } from "@/components/base/form/form";
import { InputBase, TextField } from "@/components/base/input/input";
import { Label } from "@/components/base/input/label";
import { useInitData } from "@/contexts/InitDataContext";
import { settingsConfig } from "@/config";
import { useTheme } from "next-themes";

export function ProfileContent() {
    const { data, updatePreferences } = useInitData();
    const { theme } = useTheme();
    const [selectedTimezone, setSelectedTimezone] = useState<any>(
        data?.preferences?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    );
    const [isSaving, setIsSaving] = useState(false);

    // Update timezone when data loads
    useEffect(() => {
        if (data?.preferences?.timezone) {
            setSelectedTimezone(data.preferences.timezone);
        }
    }, [data?.preferences?.timezone]);

    // Handle timezone change
    const handleTimezoneChange = async (tz: any) => {
        setSelectedTimezone(tz);
        setIsSaving(true);
        try {
            await updatePreferences({ timezone: typeof tz === 'string' ? tz : tz.value });
        } catch (error) {
            console.error("Failed to update timezone:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // Custom styles for react-select to match brand theme
    const customStyles = useMemo(() => ({
        control: (base: any, state: any) => ({
            ...base,
            backgroundColor: theme === 'dark' ? 'rgb(23 23 23)' : 'rgb(255 255 255)',
            borderColor: 'transparent',
            borderRadius: '0.5rem',
            boxShadow: state.isFocused 
                ? theme === 'dark'
                    ? '0 0 0 2px rgb(122 75 217)' // brand purple dark
                    : '0 0 0 2px rgb(122 75 217)' // brand purple light
                : theme === 'dark'
                    ? '0 0 0 1px rgb(41 41 46)' // border dark
                    : '0 0 0 1px rgb(234 234 237)', // border light
            '&:hover': {
                borderColor: 'transparent',
            },
        }),
        menu: (base: any) => ({
            ...base,
            backgroundColor: theme === 'dark' ? 'rgb(23 23 23)' : 'rgb(255 255 255)',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            border: theme === 'dark' ? '1px solid rgb(41 41 46)' : '1px solid rgb(234 234 237)',
        }),
        option: (base: any, state: any) => ({
            ...base,
            backgroundColor: state.isSelected || state.isFocused
                ? theme === 'dark'
                    ? 'rgb(48 32 71)' // brand purple alt dark
                    : 'rgb(244 238 255)' // brand purple alt light
                : 'transparent',
            color: state.isSelected || state.isFocused
                ? theme === 'dark'
                    ? 'rgb(217 184 255)' // brand secondary dark
                    : 'rgb(75 26 179)' // brand secondary light
                : theme === 'dark'
                    ? 'rgb(250 250 250)' // text primary dark
                    : 'rgb(23 23 23)', // text primary light
            '&:hover': {
                backgroundColor: theme === 'dark' ? 'rgb(48 32 71)' : 'rgb(244 238 255)',
                color: theme === 'dark' ? 'rgb(217 184 255)' : 'rgb(75 26 179)',
            },
        }),
        singleValue: (base: any) => ({
            ...base,
            color: theme === 'dark' ? 'rgb(250 250 250)' : 'rgb(23 23 23)',
        }),
        placeholder: (base: any) => ({
            ...base,
            color: theme === 'dark' ? 'rgb(161 161 170)' : 'rgb(113 113 122)',
        }),
        dropdownIndicator: (base: any) => ({
            ...base,
            color: theme === 'dark' ? 'rgb(113 113 122)' : 'rgb(161 161 170)',
        }),
        indicatorSeparator: (base: any) => ({
            ...base,
            backgroundColor: theme === 'dark' ? 'rgb(41 41 46)' : 'rgb(234 234 237)',
        }),
    }), [theme]);

    return (
        <Form
            className="flex flex-col gap-6 px-4 lg:px-8"
            onSubmit={(e) => {
                e.preventDefault();
                const data = Object.fromEntries(new FormData(e.currentTarget));
                console.log("Form data:", data);
            }}
        >

            {/* Form content */}
            <div className="flex flex-col gap-5">
                <div id="display-name" className="grid grid-cols-1 lg:grid-cols-[minmax(200px,280px)_minmax(400px,512px)] lg:gap-8 scroll-mt-8">
                    <SectionLabel.Root isRequired size="sm" title="Display name" className="max-lg:hidden" />

                    <TextField isRequired name="displayName" defaultValue={data?.username || data?.name || ""}>
                        <Label className="lg:hidden">Display name</Label>
                        <InputBase size="md" />
                    </TextField>
                </div>

                <hr className="h-px w-full border-none bg-border-secondary" />

                <div id="email" className="grid grid-cols-1 lg:grid-cols-[minmax(200px,280px)_minmax(400px,512px)] lg:gap-8 scroll-mt-8">
                    <SectionLabel.Root isRequired size="sm" title="Email address" className="max-lg:hidden" />

                    <TextField isRequired name="email" type="email" defaultValue={data?.email || ""} isDisabled>
                        <Label className="lg:hidden">Email address</Label>
                        <InputBase size="md" icon={Mail01} />
                    </TextField>
                </div>

                <hr className="h-px w-full border-none bg-border-secondary" />

                <div id="photo" className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(200px,280px)_minmax(400px,512px)] lg:gap-8 scroll-mt-8">
                    <SectionLabel.Root
                        size="sm"
                        title="Your photo"
                    />
                    <Avatar size="2xl" src={data?.profile_picture || "https://www.untitledui.com/images/avatars/olivia-rhye?fm=webp&q=80"} />
                </div>

                <hr className="h-px w-full border-none bg-border-secondary" />

                <div id="timezone" className="grid grid-cols-1 lg:grid-cols-[minmax(200px,280px)_minmax(400px,512px)] lg:gap-8 scroll-mt-8">
                    <SectionLabel.Root size="sm" title="Timezone" className="max-lg:hidden" />

                    <div className="flex flex-col gap-2">
                        <Label className="lg:hidden">Timezone</Label>
                        <TimezoneSelect
                            value={selectedTimezone}
                            onChange={handleTimezoneChange}
                            timezones={settingsConfig.timezones}
                            styles={customStyles}
                        />
                        {isSaving && <p className="text-sm text-secondary">Saving...</p>}
                    </div>
                </div>
            </div>
        </Form>
    );
}

