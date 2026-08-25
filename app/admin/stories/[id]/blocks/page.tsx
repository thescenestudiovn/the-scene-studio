"use client";

import { useRouter, useParams } from "next/navigation";
import ContentBlockPicker, { type ContentBlockSelection, type TextBlockVariant } from "../../../../../components/story/ContentBlockPicker";

const DEFAULT_TEXT_CONTENT: Record<TextBlockVariant, string> = {
  "heading-1": "Heading 1",
  "heading-2": "Heading 2",
  "heading-3": "Heading 3",
  wide: "Love stories, beautifully told through honest moments, thoughtful details and the places that mean something to you.",
  regular: "Love stories, beautifully told through honest moments, thoughtful details and the places that mean something to you.",
  narrow: "Love stories, beautifully told through honest moments, thoughtful details and the places that mean something to you.",
  "columns-2": JSON.stringify(["Love stories, beautifully told.", "Moments made to last."]),
  "columns-3": JSON.stringify(["Love stories.", "Beautiful moments.", "Timeless memories."]),
  "columns-4": JSON.stringify(["Love.", "Stories.", "Wanderlust.", "Always."]),
};

export default function StoryBlockPickerPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  async function handleSelect(selection: ContentBlockSelection) {
    const dataPayload = selection.category === "text"
      ? { body: DEFAULT_TEXT_CONTENT[selection.variant] }
      : {};

    const response = await fetch(`/api/admin/stories/${params.id}/blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: selection.category, variant: selection.variant, data: dataPayload }),
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
