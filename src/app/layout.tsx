import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { RouteProvider } from "@/providers/router-provider";
import { Theme } from "@/providers/theme";
import { InitDataProvider } from "@/contexts/InitDataContext";
import { Toaster } from "@/components/application/notifications/toaster";
import "@/styles/globals.css";
import { cx } from "@/utils/cx";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "MySquad",
    description: "App for Squad members",
    icons: {
        icon: "/logos/Badge Slanted_Blue-01.svg",
    },
};

export const viewport: Viewport = {
    themeColor: "#7f56d9",
    colorScheme: "light dark",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <style dangerouslySetInnerHTML={{
                    __html: `
                        /* Prevent theme flash during navigation */
                        html:not(.light-mode):not(.dark-mode) {
                            visibility: hidden;
                        }
                    `
                }} />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    const theme = localStorage.getItem('theme') ||
                                                 (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                                    const className = theme === 'dark' ? 'dark-mode' : 'light-mode';
                                    document.documentElement.classList.add(className);
                                } catch (e) {}
                            })();
                        `,
                    }}
                />
            </head>
            <body className={cx(inter.variable, "bg-primary antialiased")}>
                <RouteProvider>
                    <Theme>
                        <InitDataProvider>
                            {children}
                            <Toaster />
                        </InitDataProvider>
                    </Theme>
                </RouteProvider>
            </body>
        </html>
    );
}
