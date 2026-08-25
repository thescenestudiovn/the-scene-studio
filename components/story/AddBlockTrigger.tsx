"use client";

import { useRouter } from "next/navigation";

type Props = {
  storyId: string;
};

export default function AddBlockTrigger({ storyId }: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(`/admin/stories/${storyId}/blocks`)}
      className="flex w-full items-center justify-center border border-dashed border-[#aaa39a] bg-white px-5 py-6 text-[10px] uppercase tracking-[0.2em] hover:border-[#171717]"
    >
      + Add Block
    </button>
  );
}
