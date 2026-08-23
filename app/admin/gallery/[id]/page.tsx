"use client";

import { useParams } from "next/navigation";
import AdminCollectionEditor from "../../../../admin/collections/[id]/page";
import CoverPositionEditor from "../../../../admin/components/CoverPositionEditor";

export default function AdminGalleryCollectionPage() {
  const { id } = useParams<{ id: string }>();
  return <>
    <AdminCollectionEditor />
    {id && <div className="mx-auto max-w-7xl px-6 pb-16 md:px-10"><CoverPositionEditor collectionId={id} /></div>}
  </>;
}
