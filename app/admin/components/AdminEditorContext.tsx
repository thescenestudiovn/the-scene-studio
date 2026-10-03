"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { StoryBlock } from "../../../components/story/editor/types";

export type AdminBlockEditorController = {
  selectedBlockId: string;
  blocks: StoryBlock[];
  block: StoryBlock;
  storyId: string;
  onBlocksChange: (blocks: StoryBlock[]) => void;
  onUpdate: (block: StoryBlock, patch: Partial<StoryBlock>) => void;
  onDelete: (blockId: string) => void;
  onClose: () => void;
};

type ContextValue = {
  editor: AdminBlockEditorController | null;
  registerEditor: (editor: AdminBlockEditorController | null) => void;
};

const AdminEditorContext = createContext<ContextValue | null>(null);

export function AdminEditorProvider({ children }: { children: React.ReactNode }) {
  const [editor, setEditor] = useState<AdminBlockEditorController | null>(null);
  const value = useMemo(() => ({ editor, registerEditor: setEditor }), [editor]);
  return <AdminEditorContext.Provider value={value}>{children}</AdminEditorContext.Provider>;
}

export function useAdminEditor() {
  const context = useContext(AdminEditorContext);
  if (!context) throw new Error("useAdminEditor must be used inside AdminEditorProvider");
  return context;
}
