"use client";

import { CreateProvider } from "./CreateContext";

export default function CreateLayout({ children }: { children: React.ReactNode }) {
    return <CreateProvider>{children}</CreateProvider>;
}
