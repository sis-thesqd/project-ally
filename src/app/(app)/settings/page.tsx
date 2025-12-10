"use client";

import { useEffect, useRef, useState } from "react";
import { SearchLg } from "@untitledui/icons";
import { TabList, Tabs } from "@/components/application/tabs/tabs";
import { InputBase, TextField } from "@/components/base/input/input";
import { NativeSelect } from "@/components/base/select/select-native";
import { settingsConfig } from "@/config";
import { ProfileContent } from "./profile-content";
import { DefaultsContent } from "./defaults-content";

export default function SettingsPage() {
    const [selectedTab, setSelectedTab] = useState<string>(settingsConfig.defaultTab);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Handle focus from command menu or search
    const handleSettingsFocus = (sectionId: string, tab: string) => {
        // Switch to the correct tab
        setSelectedTab(tab);
        
        // Scroll to and highlight the section
        setTimeout(() => {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
                element.classList.add("ring-1", "ring-brand/30", "rounded-lg", "transition-all", "-m-4", "p-4");
                setTimeout(() => {
                    element.classList.remove("ring-1", "ring-brand/30", "-m-4", "p-4");
                }, 2000);
            }
        }, 100);
    };

    // Handle focus from command menu (via sessionStorage or custom event)
    useEffect(() => {
        // Check sessionStorage on mount (for navigation from other pages)
        const focusData = sessionStorage.getItem('settings_focus');
        if (focusData) {
            try {
                const { sectionId, tab } = JSON.parse(focusData);
                // Clear it immediately so it only works once
                sessionStorage.removeItem('settings_focus');
                handleSettingsFocus(sectionId, tab);
            } catch (e) {
                console.error('Error parsing settings focus data:', e);
            }
        }

        // Listen for custom event (for when already on settings page)
        const handleCustomEvent = (e: CustomEvent) => {
            const { sectionId, tab } = e.detail;
            handleSettingsFocus(sectionId, tab);
        };

        window.addEventListener('settings-focus', handleCustomEvent as EventListener);
        return () => window.removeEventListener('settings-focus', handleCustomEvent as EventListener);
    }, []);

    // Global keyboard shortcut listener for Shift+K
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            // Check for Shift+K
            if (e.shiftKey && e.key === 'K') {
                e.preventDefault();
                // Focus the search input
                const input = document.querySelector('input[placeholder="Search settings"]') as HTMLInputElement;
                if (input) {
                    input.focus();
                    setShowSearchResults(true);
                }
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    const handleTabChange = (value: string) => {
        setSelectedTab(value);
    };

    // Filter settings based on search query
    const searchResults = searchQuery.trim().length > 0
        ? settingsConfig.searchableSettings.filter((setting) => {
            const query = searchQuery.toLowerCase();
            return (
                setting.label.toLowerCase().includes(query) ||
                setting.description.toLowerCase().includes(query) ||
                setting.keywords.some((keyword) => keyword.toLowerCase().includes(query))
            );
        })
        : [];

    // Reset highlighted index when search results change
    useState(() => {
        setHighlightedIndex(0);
    });

    // Handle search result click
    const handleSearchResultClick = (setting: typeof settingsConfig.searchableSettings[number]) => {
        // Switch to the correct tab
        setSelectedTab(setting.tab);
        
        // Clear search
        setSearchQuery("");
        setShowSearchResults(false);
        setHighlightedIndex(0);
        
        // Scroll to and highlight the section
        setTimeout(() => {
            const element = document.getElementById(setting.sectionId);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
                element.classList.add("ring-1", "ring-brand/30", "rounded-lg", "transition-all", "-m-4", "p-4");
                setTimeout(() => {
                    element.classList.remove("ring-1", "ring-brand/30", "-m-4", "p-4");
                }, 2000);
            }
        }, 100);
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSearchResults || searchResults.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((prev) => (prev + 1) % searchResults.length);
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
                break;
            case "Enter":
                e.preventDefault();
                if (searchResults[highlightedIndex]) {
                    handleSearchResultClick(searchResults[highlightedIndex]);
                }
                break;
            case "Escape":
                e.preventDefault();
                setShowSearchResults(false);
                setSearchQuery("");
                setHighlightedIndex(0);
                break;
        }
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
                            <div className="flex flex-col gap-4 lg:flex-row relative">
                                <TextField 
                                    className="lg:w-80"
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                >
                                    <InputBase 
                                        size="sm" 
                                        placeholder="Search settings" 
                                        icon={SearchLg}
                                        onFocus={() => setShowSearchResults(true)}
                                        onBlur={() => {
                                            // Delay to allow click on results
                                            setTimeout(() => setShowSearchResults(false), 200);
                                        }}
                                        onKeyDown={handleKeyDown}
                                    />
                                </TextField>
                                
                                {/* Search results dropdown */}
                                {showSearchResults && searchResults.length > 0 && (
                                    <div className="absolute top-full right-0 mt-2 w-80 bg-primary rounded-lg shadow-lg ring-1 ring-primary z-50 max-h-96 overflow-auto">
                                        {searchResults.map((result, index) => (
                                            <button
                                                key={result.id}
                                                type="button"
                                                onClick={() => handleSearchResultClick(result)}
                                                className={`w-full text-left px-4 py-3 transition-colors border-b border-border-secondary last:border-0 first:rounded-t-lg last:rounded-b-lg ${
                                                    index === highlightedIndex
                                                        ? "bg-brand-primary_alt text-brand-secondary"
                                                        : "hover:bg-primary_hover"
                                                }`}
                                            >
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-sm font-medium">{result.label}</p>
                                                    <p className={`text-xs ${index === highlightedIndex ? "opacity-90" : "text-secondary"}`}>
                                                        {result.description}
                                                    </p>
                                                    <p className={`text-xs ${index === highlightedIndex ? "opacity-75" : "text-tertiary"}`}>
                                                        in {settingsConfig.tabs.find(t => t.id === result.tab)?.label}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                
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
