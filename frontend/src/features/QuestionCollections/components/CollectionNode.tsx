import clsx from "clsx";
import {
  Check,
  ChevronRight,
  Folder,
  MoveRight,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { type FormEvent, useState } from "react";

import { DraggableContainer } from "../../../components/DraggableContainer";
import type { RenderNodeProps } from "../../../components/ResourceTree/ResourceTree";
import { useDeleteCollection } from "../hooks/useDeleteCollection";
import { useUpdateCollectionTitle } from "../hooks/useUpdateCollection";
import type { QuestionCollectionTreeNode } from "../instance/types";

type CollectionNodeProps = RenderNodeProps<QuestionCollectionTreeNode> & {
  draggingNodeId: string | null;
  dropTargetNodeId: string | null;
  onDragStart: (nodeId: string) => void;
  onDragOverCollection: (nodeId: string | null) => void;
  onDragEnd: () => void;
};

function DropTargetMessage() {
  return (
    <span className="mt-0.5 flex items-center gap-1 text-xs font-medium text-accent">
      <MoveRight className="size-3" aria-hidden="true" />
      Move under this collection
    </span>
  );
}

type ExpandCollectionButtonProps = {
  hasChildren: boolean;
  isExpanded: boolean;
  onToggleExpanded: () => void;
};

function ExpandCollectionButton({
  hasChildren,
  isExpanded,
  onToggleExpanded,
}: ExpandCollectionButtonProps) {
  return (
    <button
      type="button"
      aria-label={isExpanded ? "Collapse collection" : "Expand collection"}
      aria-expanded={hasChildren ? isExpanded : undefined}
      disabled={!hasChildren}
      onClick={onToggleExpanded}
      className={clsx(
        "flex size-7 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors",
        hasChildren
          ? "hover:bg-surface-strong hover:text-text focus-visible:outline focus-visible:outline-offset-1 focus-visible:outline-accent"
          : "cursor-default opacity-25",
      )}
    >
      <ChevronRight
        className={clsx(
          "size-4 transition-transform",
          isExpanded && "rotate-90",
        )}
      />
    </button>
  );
}

type CollectionTitleSectionProps = {
  title: string;
  questionCount: number;
  subcollectionCount: number;
  isDropTarget: boolean;
  isEditing: boolean;
  draftTitle: string;
  disabled: boolean;
  onSelectNode: () => void;
  onDraftTitleChange: (title: string) => void;
  onSaveTitle: () => void;
  onCancelEdit: () => void;
};

function CollectionTitleSection({
  title,
  questionCount,
  subcollectionCount,
  isDropTarget,
  isEditing,
  draftTitle,
  disabled,
  onSelectNode,
  onDraftTitleChange,
  onSaveTitle,
  onCancelEdit,
}: CollectionTitleSectionProps) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSaveTitle();
  }

  if (isEditing) {
    return (
      <form
        className="flex min-w-0 flex-1 items-center gap-2"
        onSubmit={handleSubmit}
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent/10">
          <Folder className="size-4 text-accent" aria-hidden="true" />
        </span>
        <input
          autoFocus
          value={draftTitle}
          disabled={disabled}
          onChange={(e) => onDraftTitleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onCancelEdit();
          }}
          className="min-w-0 flex-1 rounded-md border border-accent/35 bg-surface px-2 py-1.5 text-sm font-medium text-text outline-none ring-2 ring-accent/15 transition focus:border-accent"
        />
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelectNode}
      className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left font-medium outline-none transition focus-visible:outline focus-visible:outline-offset-1 focus-visible:outline-accent"
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent/10">
        <Folder className="size-4 text-accent" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate">{title}</span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-normal text-text-soft">
          {subcollectionCount > 0 ? (
            <span className="inline-flex items-center gap-1">
              
              {subcollectionCount}{" "}
              {subcollectionCount === 1
                ? "inner collection"
                : "inner collections"}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            {questionCount} {questionCount === 1 ? "question" : "questions"}
          </span>
        </span>
        {isDropTarget ? <DropTargetMessage /> : null}
      </span>
    </button>
  );
}

type CollectionActionButtonsProps = {
  isEditing: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  onStartEdit: () => void;
  onSaveTitle: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
};

function CollectionActionButtons({
  isEditing,
  isSaving,
  isDeleting,
  onStartEdit,
  onSaveTitle,
  onCancelEdit,
  onDelete,
}: CollectionActionButtonsProps) {
  if (isEditing) {
    return (
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          aria-label="Save collection title"
          disabled={isSaving}
          onClick={onSaveTitle}
          className="flex size-7 items-center justify-center rounded-md text-accent transition hover:bg-accent/10 focus-visible:outline focus-visible:outline-offset-1 focus-visible:outline-accent disabled:opacity-50"
        >
          <Check className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Cancel title edit"
          disabled={isSaving}
          onClick={onCancelEdit}
          className="flex size-7 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-strong hover:text-text focus-visible:outline focus-visible:outline-offset-1 focus-visible:outline-accent disabled:opacity-50"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-1 opacity-70 transition group-hover:opacity-100">
      <button
        type="button"
        aria-label="Edit collection title"
        onClick={onStartEdit}
        className="flex size-7 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-strong hover:text-text focus-visible:outline focus-visible:outline-offset-1 focus-visible:outline-accent"
      >
        <Pencil className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Delete collection"
        disabled={isDeleting}
        onClick={onDelete}
        className="flex size-7 items-center justify-center rounded-md text-text-muted transition hover:bg-red-500/10 hover:text-red-600 focus-visible:outline focus-visible:outline-offset-1 focus-visible:outline-red-600 disabled:opacity-50"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export default function CollectionNode({
  draggingNodeId,
  dropTargetNodeId,
  onDragStart,
  onDragOverCollection,
  onDragEnd,
  ...props
}: CollectionNodeProps) {
  const nodeId = props.node.data?.id ?? props.node.id;
  const hasChildren = props.state.hasChildren;
  const isDragging = draggingNodeId === nodeId;
  const isDropTarget = dropTargetNodeId === nodeId && draggingNodeId !== nodeId;
  const depthOffset = props.state.depth * 18 + 8;
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(props.node.label);
  const { loading: isSavingTitle, updateCollectionTitle } =
    useUpdateCollectionTitle();
  const { loading: isDeletingCollection, deleteCollection } =
    useDeleteCollection();

  function startEditingTitle() {
    setDraftTitle(props.node.label);
    setIsEditing(true);
  }

  function cancelEditingTitle() {
    setDraftTitle(props.node.label);
    setIsEditing(false);
  }

  async function saveTitle() {
    const trimmedTitle = draftTitle.trim();
    if (!trimmedTitle || trimmedTitle === props.node.label) {
      cancelEditingTitle();
      return;
    }

    const updatedCollection = await updateCollectionTitle(nodeId, trimmedTitle);
    if (updatedCollection) {
      setIsEditing(false);
    }
  }

  async function deleteNode() {
    await deleteCollection(nodeId);
  }

  const questionCount =
    props.node.kind === "collection"
      ? (props.node.data?.question_ids.length ?? 0)
      : 0;
  const subcollectionCount =
    props.node.kind === "collection"
      ? (props.node.data?.subcollections_len ?? 0)
      : 0;

  return (
    <DraggableContainer
      id={nodeId}
      draggableId={nodeId}
      dragHandleLabel={`Drag ${props.node.label}`}
      className={clsx(
        "group min-h-11 rounded-lg border border-transparent px-2 py-1.5 text-sm transition select-none bg-surface",
        props.state.isSelected
          ? "bg-accent/15 text-text ring-1 ring-accent/35"
          : "text-text-muted hover:bg-surface-muted hover:text-text",
      )}
      contentClassName="flex items-center gap-2"
      handleOffset={depthOffset}
      style={{ paddingLeft: `${depthOffset}px` }}
      onDragEnd={onDragEnd}
      isDragging={isDragging}
      isDropTarget={isDropTarget}
      onDragOver={onDragOverCollection}
      onDragStart={onDragStart}
    >
      <ExpandCollectionButton
        hasChildren={hasChildren}
        isExpanded={props.state.isExpanded}
        onToggleExpanded={props.onToggleExpanded}
      />

      <CollectionTitleSection
        title={props.node.label}
        questionCount={questionCount}
        subcollectionCount={subcollectionCount}
        isDropTarget={isDropTarget}
        isEditing={isEditing}
        draftTitle={draftTitle}
        disabled={isSavingTitle}
        onSelectNode={props.onSelectNode}
        onDraftTitleChange={setDraftTitle}
        onSaveTitle={saveTitle}
        onCancelEdit={cancelEditingTitle}
      />

      <CollectionActionButtons
        isEditing={isEditing}
        isSaving={isSavingTitle}
        isDeleting={isDeletingCollection}
        onStartEdit={startEditingTitle}
        onSaveTitle={saveTitle}
        onCancelEdit={cancelEditingTitle}
        onDelete={deleteNode}
      />
    </DraggableContainer>
  );
}
