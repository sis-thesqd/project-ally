"use client";

import { CloseButton } from "@/components/base/buttons/close-button";

export const BannerSlimBrandFullWidth = () => {
    return (
        <div className="relative border-b border-brand_alt bg-brand-section_subtle md:border-brand">
            <div className="p-4 md:py-3.5">
                <div className="flex flex-col gap-0.5 md:flex-row md:justify-center md:gap-1.5 md:text-center">
                    <p className="pr-8 text-md font-semibold text-primary_on-brand md:truncate md:pr-0">We've just launched a new feature!</p>
                    <p className="text-md text-tertiary_on-brand md:truncate">
                        Check out the{" "}
                        <a
                            href="#"
                            className="rounded-xs underline underline-offset-3 outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                            new dashboard
                        </a>
                        .
                    </p>
                </div>
            </div>
            <div className="absolute top-2 right-2 md:top-1.5 md:right-2">
                <CloseButton size="md" theme="dark" label="Dismiss" />
            </div>
        </div>
    );
};
