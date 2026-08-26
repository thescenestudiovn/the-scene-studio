"use client";

import { useRouter } from "next/navigation";

type Props = {
  storyId: string;
  afterBlockId?: string;
};

export default function AddBlockTrigger({ storyId, afterBlockId }: Props) {
  const router = useRouter();

  return (
    <div className="group relative h-8 w-full" aria-label="Insert block">
      <button
        type="button"
        onClick={() => {
          const query = afterBlockId ? `?after=${encodeURIComponent(afterBlockId)}` : "";
          router.push(`/admin/stories/${storyId}/blocks${query}`);
        }}
        aria-label="Add block"
        className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100 md:max-lg:opacity-100 max-md:opacity-100"
      >
        <span className="absolute left-0 right-0 h-px bg-[#bdb7ad]" aria-hidden="true" />
        <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[#bdb7ad] bg-[#f5f2ec] text-sm font-light leading-none text-[#5f5a52] transition-transform duration-150 group-hover:scale-105">
          +
        </span>
      </button>
    </div>
  );
}
