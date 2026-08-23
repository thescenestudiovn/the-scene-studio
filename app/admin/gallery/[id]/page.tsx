"use client";

import { useParams } from "next/navigation";
import AdminCollectionEditor from "../../collections/[id]/page";
import CoverPositionEditor from "../../components/CoverPositionEditor";

export default function AdminGalleryCollectionPage() {
  const { id } = useParams<{ id: string }>();
  return <>
    <AdminCollectionEditor />
    {id && <div className="mx-auto max-w-7xl px-6 pb-16 md:px-10"><CoverPositionEditor collectionId={id} /></div>}
  </>;
}
