import { notFound } from "next/navigation";
import AdminPagesPage from "../page";
import AdminSettingsPage from "../../settings/page";

export default async function AdminPageRoute({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    if (slug === "contact") return <AdminSettingsPage />;
    if (slug === "home" || slug === "about") return <AdminPagesPage />;
    notFound();
}