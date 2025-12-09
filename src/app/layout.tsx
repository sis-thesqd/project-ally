import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { RouteProvider } from "@/providers/router-provider";
import { Theme } from "@/providers/theme";
import { InitDataProvider } from "@/contexts/InitDataContext";
import { Toaster } from "@/components/application/notifications/toaster";
import { PWARegister } from "@/components/pwa/pwa-register";
import { NotificationPrompt } from "@/components/pwa/notification-prompt";
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
    manifest: "/manifest.json",
    icons: {
        icon: [
            { url: "/logos/Badge Slanted_Blue-01.svg", type: "image/svg+xml" },
            { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
            { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
        ],
        apple: [
            { url: "/icons/apple-touch-icon-180x180.png", sizes: "180x180" },
            { url: "/icons/apple-touch-icon-152x152.png", sizes: "152x152" },
            { url: "/icons/apple-touch-icon-120x120.png", sizes: "120x120" },
        ],
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "MySquad",
    },
};

export const viewport: Viewport = {
    themeColor: "#7f56d9",
    colorScheme: "light dark",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
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
                            <PWARegister />
                            <NotificationPrompt />
                        </InitDataProvider>
                    </Theme>
                </RouteProvider>
            </body>
        </html>
    );
}
