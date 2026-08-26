"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import ContentBlockPicker, { type ContentBlockSelection } from "../../../../../components/story/ContentBlockPicker";

export default function StoryBlockPickerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ id: string }>();

  async function handleSelect(selection: ContentBlockSelection) {
    const after = searchParams.get("after");
    const response = await fetch(`/api/admin/stories/${params.id}/blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: selection.category,
        variant: selection.variant,
        data: selection.category === "image" ? selection.data : {},
        after_block_id: after || null,
      }),
    });
    const data = await response.json() as { success?: boolean; error?: string };
    if (!response.ok || !data.success) {
      window.alert(data.error ?? "Failed to add block");
      return;
    }
    router.push(`/admin/stories/${params.id}`);
  }

  return <ContentBlockPicker open onClose={() => router.back()} onSelect={handleSelect} />;
}
