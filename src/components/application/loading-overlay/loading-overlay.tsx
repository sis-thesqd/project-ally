"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";

interface LoadingOverlayProps {
    isVisible: boolean;
    label?: string;
}

export const LoadingOverlay = ({ isVisible, label = "Loading..." }: LoadingOverlayProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const overlay = (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.4)",
                        backdropFilter: "blur(12px) saturate(180%)",
                        WebkitBackdropFilter: "blur(12px) saturate(180%)",
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                        className="flex flex-col items-center justify-center rounded-2xl bg-white/70 px-8 py-6 shadow-lg ring-1 ring-black/5 dark:bg-gray-900/70 dark:ring-white/10"
                        style={{
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                        }}
                    >
                        <LoadingIndicator type="line-simple" size="md" label={label} />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // Use portal to render at document.body level, ensuring it's above all modals
    if (!mounted) return null;
    return createPortal(overlay, document.body);
};
