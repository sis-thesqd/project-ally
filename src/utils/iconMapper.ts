import {
    BarChartSquare02,
    CheckDone01,
    HomeLine,
    PieChart03,
    Rows01,
    Users01,
} from '@untitledui/icons';
import type { FC } from 'react';

type IconComponent = FC<{ className?: string }>;

export const iconMap: Record<string, IconComponent> = {
    'HomeLine': HomeLine,
    'BarChartSquare02': BarChartSquare02,
    'Rows01': Rows01,
    'CheckDone01': CheckDone01,
    'PieChart03': PieChart03,
    'Users01': Users01,
};

export function getIconByName(iconName: string): IconComponent {
    return iconMap[iconName] || HomeLine;
}
