'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon02, Sun } from '@untitledui/icons';
import { ButtonUtility } from '@/components/base/buttons/button-utility';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="size-9" />;
    }

    const isDark = theme === 'dark';

    return (
        <ButtonUtility
            size="sm"
            color="tertiary"
            icon={isDark ? Sun : Moon02}
            tooltip={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onPress={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label="Toggle theme"
        />
    );
}
