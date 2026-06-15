"use client";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";

function Drag() {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: "drag1" });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ width: 100, height: 100, background: "red", cursor: "grab", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", userSelect: "none" }}
    >
      DRAG ME
    </div>
  );
}

function Drop() {
  const { setNodeRef, isOver } = useDroppable({ id: "drop1" });
  return (
    <div
      ref={setNodeRef}
      style={{ width: 300, height: 300, background: isOver ? "lime" : "gray", marginTop: 40, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: "bold", color: isOver ? "black" : "white" }}
    >
      {isOver ? "✅ DROP HERE!" : "DROP ZONE"}
    </div>
  );
}

export default function TestDnd() {
  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 24 }}>dnd-kit Isolation Test</h1>
      <DndContext onDragEnd={(e) => console.log("🟩 [TestDnd] over:", e.over)}>
        <Drag />
        <Drop />
      </DndContext>
    </div>
  );
}
