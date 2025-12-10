"use client";

import { useState } from "react";
import { SearchLg } from "@untitledui/icons";
import { TabList, Tabs } from "@/components/application/tabs/tabs";
import { Input } from "@/components/base/input/input";
import { NativeSelect } from "@/components/base/select/select-native";
import { settingsConfig } from "@/config";
import { ProfileContent } from "./profile-content";
import { DefaultsContent } from "./defaults-content";

export default function SettingsPage() {
    const [selectedTab, setSelectedTab] = useState<string>(settingsConfig.defaultTab);

    const handleTabChange = (value: string) => {
        setSelectedTab(value);
    };

    return (
        <main className="min-w-0 flex-1 bg-primary pt-8 pb-12 overflow-auto">
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-5 px-4 lg:px-8">
                    {/* Page header simple with search */}
                    <div className="relative flex flex-col gap-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                            <div className="flex flex-col gap-0.5 lg:gap-1">
                                <h1 className="text-xl font-semibold text-primary lg:text-display-xs">Settings</h1>
                            </div>
                            <div className="flex flex-col gap-4 lg:flex-row">
                                <Input className="lg:w-80" size="sm" shortcut aria-label="Search" placeholder="Search" icon={SearchLg} />
                            </div>
                        </div>
                    </div>

                    <NativeSelect
                        aria-label="Page tabs"
                        className="md:hidden"
                        value={selectedTab}
                        onChange={(event) => handleTabChange(event.target.value)}
                        options={settingsConfig.tabs.map((tab) => ({ label: tab.label, value: tab.id }))}
                    />
                    <div className="-mx-4 -my-1 scrollbar-hide flex overflow-auto px-4 py-1 lg:-mx-8 lg:px-8">
                        <Tabs className="hidden md:flex md:w-auto" selectedKey={selectedTab} onSelectionChange={(value) => handleTabChange(value as string)}>
                            <TabList type="button-minimal" items={[...settingsConfig.tabs]} />
                        </Tabs>
                    </div>
                </div>

                {/* Render appropriate content based on current tab */}
                {selectedTab === "defaults" ? <DefaultsContent /> : <ProfileContent />}
            </div>
        </main>
    );
}
