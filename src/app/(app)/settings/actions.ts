'use server';

import { revalidateTag } from 'next/cache';

export async function revalidateInitData() {
    // Revalidate the init-data cache tag
    revalidateTag('init-data');

    return { success: true };
}
