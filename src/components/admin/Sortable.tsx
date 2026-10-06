"use client";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useId } from "react";

/**
 * Drag & drop (mouse, touch and keyboard: focus the handle, Space, arrows, Space).
 * `onReorder` receives the new array; callers persist it.
 */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  grid = false,
  className = "",
}: {
  items: T[];
  onReorder: (next: T[]) => void;
  renderItem: (item: T, handle: React.ReactNode, index: number) => React.ReactNode;
  grid?: boolean;
  className?: string;
}) {
  // Stable id so the server- and client-rendered aria-describedby match (dnd-kit otherwise uses a global counter).
  const dndId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    onReorder(arrayMove(items, from, to));
  };
  return (
    <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={grid ? rectSortingStrategy : verticalListSortingStrategy}>
        <ul className={className}>
          {items.map((item, i) => (
            <SortableItem key={item.id} id={item.id}>
              {(handle) => renderItem(item, handle, i)}
            </SortableItem>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableItem({ id, children }: { id: string; children: (handle: React.ReactNode) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label="Drag to reorder"
      className="cursor-grab touch-none rounded-md px-1.5 py-1 text-ink-3 hover:bg-white/5 hover:text-ink active:cursor-grabbing"
    >
      <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor" aria-hidden>
        {[2, 8, 14].flatMap((y) => [<circle key={`a${y}`} cx="3" cy={y} r="1.4" />, <circle key={`b${y}`} cx="9" cy={y} r="1.4" />])}
      </svg>
    </button>
  );
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative ${isDragging ? "z-10 opacity-80 shadow-2xl" : ""}`}
    >
      {children(handle)}
    </li>
  );
}
