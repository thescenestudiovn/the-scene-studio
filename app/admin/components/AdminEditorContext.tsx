"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { StoryBlock } from "../../../components/story/editor/types";

export type AdminPageActions = {
  save: () => void;
  saving: boolean;
  previewUrl: string;
};

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

type EditorStateContextValue = { editor: AdminBlockEditorController | null; pageActions: AdminPageActions | null };
type EditorActionsContextValue = { registerEditor: (editor: AdminBlockEditorController | null) => void; registerPageActions: (actions: AdminPageActions | null) => void };

const AdminEditorStateContext = createContext<EditorStateContextValue | null>(null);
const AdminEditorActionsContext = createContext<EditorActionsContextValue | null>(null);

export function AdminEditorProvider({ children }: { children: React.ReactNode }) {
  const [editor, setEditor] = useState<AdminBlockEditorController | null>(null);
  const [pageActions, setPageActions] = useState<AdminPageActions | null>(null);
  const [, setEditorRevision] = useState(0);
  const registerEditor = useCallback((next: AdminBlockEditorController | null) => {
    setEditor(next);
    setEditorRevision(revision => revision + 1);
  }, []);
  const actions = useMemo(() => ({ registerEditor, registerPageActions: setPageActions }), [registerEditor]);
  return (
    <AdminEditorActionsContext.Provider value={actions}>
      <AdminEditorStateContext.Provider value={{ editor, pageActions }}>
        {children}
      </AdminEditorStateContext.Provider>
    </AdminEditorActionsContext.Provider>
  );
}

export function useAdminEditor() {
  const context = useContext(AdminEditorStateContext);
  if (!context) throw new Error("useAdminEditor must be used inside AdminEditorProvider");
  return context;
}

export function useAdminEditorActions() {
  const context = useContext(AdminEditorActionsContext);
  if (!context) throw new Error("useAdminEditorActions must be used inside AdminEditorProvider");
  return context;
}
