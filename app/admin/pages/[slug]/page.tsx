import { notFound } from "next/navigation";
import AdminPagesPage from "../page";

export default async function AdminPageRoute({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    if (!slug || slug.includes("/")) notFound();
    return <AdminPagesPage initialSlug={slug} />;
}
