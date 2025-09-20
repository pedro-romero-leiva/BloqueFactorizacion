"use client";

import React, { useRef } from "react";
import type { Block } from "@/types/blocks";
import BlockComponent from "./block";

interface CanvasProps {
  blocks: Block[];
  onBlockClick: (blockId: string) => void;
  onCombineBlocks: (draggedId: string, targetId: string) => void;
  onBlockMove: (blockId: string, x: number, y: number) => void;
  onBlockDelete: (blockId: string) => void;
  onBlockDragStart: (e: React.DragEvent<HTMLDivElement>, block: Block) => void;
  onBlockDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
}

export default function Canvas({
  blocks,
  onBlockClick,
  onCombineBlocks,
  onBlockMove,
  onBlockDelete,
  onBlockDragStart,
  onBlockDragEnd
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const blockId = e.dataTransfer.getData("blockId");
    if (!blockId || !canvasRef.current) return;
    
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const blockSize = {
      cuadrado: { width: 280, height: 280 },
      cubo: { width: 280, height: 280 },
      simple: { width: 150, height: 120 },
      product: { width: 150, height: 120 },
      power: { width: 150, height: 120 },
    };
    
    const size = block.type === 'mold' ? blockSize[block.moldType] : blockSize[block.type];

    const canvasRect = canvasRef.current.getBoundingClientRect();

    const x = e.clientX - canvasRect.left - (size.width / 2);
    const y = e.clientY - canvasRect.top - (size.height / 2);

    onBlockMove(blockId, x, y);
    onBlockDragEnd(e);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      ref={canvasRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="w-full h-full relative overflow-hidden"
    >
      {blocks.map((block) => (
        <BlockComponent
          key={block.id}
          block={block}
          onClick={onBlockClick}
          onDrop={onCombineBlocks}
          onDelete={onBlockDelete}
          onDragStart={onBlockDragStart}
          onDragEnd={onBlockDragEnd}
        />
      ))}
    </div>
  );
}
