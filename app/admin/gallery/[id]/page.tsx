"use client";

import { useParams } from "next/navigation";
import AdminCollectionEditor from "../../collections/[id]/page";
import CoverPositionEditor from "../../components/CoverPositionEditor";

export default function AdminGalleryCollectionPage() {
  const { id } = useParams<{ id: string }>();
  return <main className="min-h-screen bg-[#f7f5f0] text-[#171717]"><div className="mx-auto max-w-7xl px-6 pt-10 md:px-10"><CoverPositionEditor collectionId={id} /></div><AdminCollectionEditor /></main>;
}
