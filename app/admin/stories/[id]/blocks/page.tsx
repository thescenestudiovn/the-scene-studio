"use client";

import { useRouter, useParams } from "next/navigation";
import ContentBlockPicker, { type ContentBlockSelection } from "../../../../../../components/story/ContentBlockPicker";

export default function StoryBlockPickerPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  function handleSelect(selection: ContentBlockSelection) {
    // Keep the picker integration isolated for the first UI pass.
    // The Story Editor will persist the selected block once the editor wiring is merged.
    console.log("Selected story block", params.id, selection);
    router.back();
  }

  return (
    <ContentBlockPicker
      open
      onClose={() => router.back()}
      onSelect={handleSelect}
    />
  );
}
