"use client";

import React, { useRef } from "react";
import type { Block, AbacusBlock } from "@/types/blocks";
import BlockComponent from "./block";

const GRID_SIZE = 20;

interface CanvasProps {
  blocks: Block[];
  onBlockClick: (blockId: string) => void;
  onCombineBlocks: (draggedId: string, targetId: string) => void;
  onBlockMove: (blockId: string, x: number, y: number) => void;
  onBlockDelete: (blockId: string) => void;
  onBlockDragStart: (e: React.DragEvent<HTMLDivElement>, block: Block) => void;
  onBlockDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onAbacusChange: (updatedAbacus: AbacusBlock) => void;
  onAbacusExport: (blockId: string) => void;
}

export default function Canvas({
  blocks,
  onBlockClick,
  onCombineBlocks,
  onBlockMove,
  onBlockDelete,
  onBlockDragStart,
  onBlockDragEnd,
  onAbacusChange,
  onAbacusExport,
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
      abacus: { width: 320, height: 100 }, // Height is dynamic, use an estimate
    };
    
    let size;
    if (block.type === 'mold') {
      size = blockSize[block.moldType];
    } else if (block.type === 'abacus') {
      const abacusBlock = block as AbacusBlock;
      const rowHeight = 32; // from abacus-row h-6 (24px) + gap (8px)
      const headerHeight = 40; // from abacus h-8 (32px) + gap
      const dynamicHeight = headerHeight + (abacusBlock.rows.length * rowHeight);
      size = { width: blockSize.abacus.width, height: dynamicHeight};
    }
    else {
      size = blockSize[block.type as keyof typeof blockSize];
    }

    const canvasRect = canvasRef.current.getBoundingClientRect();

    let x = e.clientX - canvasRect.left - (size.width / 2);
    let y = e.clientY - canvasRect.top - (size.height / 2);
    
    // Snap to grid
    x = Math.round(x / GRID_SIZE) * GRID_SIZE;
    y = Math.round(y / GRID_SIZE) * GRID_SIZE;

    onBlockMove(blockId, x, y);
    onBlockDragEnd(e);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      id="canvas"
      ref={canvasRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="w-full h-full relative overflow-hidden"
      data-testid="canvas"
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
          onAbacusChange={onAbacusChange}
          onAbacusExport={onAbacusExport}
        />
      ))}
    </div>
  );
}
