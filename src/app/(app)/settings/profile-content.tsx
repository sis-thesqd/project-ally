"use client";

import { useEffect, useState } from "react";
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

export function ProfileContent() {
    const { data, updatePreferences } = useInitData();
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
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(200px,280px)_minmax(400px,512px)] lg:gap-8">
                    <SectionLabel.Root isRequired size="sm" title="Display name" className="max-lg:hidden" />

                    <TextField isRequired name="displayName" defaultValue={data?.username || data?.name || ""}>
                        <Label className="lg:hidden">Display name</Label>
                        <InputBase size="md" />
                    </TextField>
                </div>

                <hr className="h-px w-full border-none bg-border-secondary" />

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(200px,280px)_minmax(400px,512px)] lg:gap-8">
                    <SectionLabel.Root isRequired size="sm" title="Email address" className="max-lg:hidden" />

                    <TextField isRequired name="email" type="email" defaultValue={data?.email || ""} isDisabled>
                        <Label className="lg:hidden">Email address</Label>
                        <InputBase size="md" icon={Mail01} />
                    </TextField>
                </div>

                <hr className="h-px w-full border-none bg-border-secondary" />

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(200px,280px)_minmax(400px,512px)] lg:gap-8">
                    <SectionLabel.Root
                        size="sm"
                        title="Your photo"
                    />
                    <Avatar size="2xl" src={data?.profile_picture || "https://www.untitledui.com/images/avatars/olivia-rhye?fm=webp&q=80"} />
                </div>

                <hr className="h-px w-full border-none bg-border-secondary" />

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(200px,280px)_minmax(400px,512px)] lg:gap-8">
                    <SectionLabel.Root size="sm" title="Timezone" className="max-lg:hidden" />

                    <div className="flex flex-col gap-2">
                        <Label className="lg:hidden">Timezone</Label>
                        <TimezoneSelect
                            value={selectedTimezone}
                            onChange={handleTimezoneChange}
                            timezones={settingsConfig.timezones}
                        />
                        {isSaving && <p className="text-sm text-secondary">Saving...</p>}
                    </div>
                </div>
            </div>
        </Form>
    );
}

