import { notFound } from "next/navigation";
import AdminPagesPage from "../page";

export default async function AdminPageRoute({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    if (slug === "home" || slug === "about" || slug === "contact") return <AdminPagesPage initialSlug={slug} />;
    notFound();
}
