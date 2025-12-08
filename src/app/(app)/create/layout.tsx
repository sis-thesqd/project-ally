export default function CreateLayout({ children }: { children: React.ReactNode }) {
    // CreateProvider is now in the parent app layout (layout-client.tsx)
    // so it's available both in the sidebar and in the create pages
    return <>{children}</>;
}
