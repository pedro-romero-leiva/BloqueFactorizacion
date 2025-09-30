"use client";

import React, { useState } from "react";
import { X, Minus, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import type { Block, MoldBlock, NumberBlock, CubeMoldBlock, AbacusBlock } from "@/types/blocks";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import AbacusComponent from "./abacus";

interface BlockProps {
  block: Block;
  onClick: (blockId: string) => void;
  onDrop: (draggedId: string, targetId:string) => void;
  onDelete: (blockId: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, block: Block) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onAbacusChange?: (updatedAbacus: AbacusBlock) => void;
  onAbacusExport?: (blockId: string) => void;
}

const NumberBlockContent = ({ block }: { block: NumberBlock }) => {
  switch (block.type) {
    case "power":
      return (
        <div className="text-center">
          <p className="text-5xl font-black">
            {block.base}
            <sup className="text-2xl font-bold align-super -top-4">
              {block.exponent}
            </sup>
          </p>
        </div>
      );
    case "product":
      return <p className="text-5xl font-black">{block.value}</p>;
    case "simple":
    default:
      return <p className="text-5xl font-black">{block.value}</p>;
  }
};

const SquareMoldContent = ({ block }: { block: MoldBlock }) => {
  const units = React.useMemo(() => Array.from({ length: block.capacity }, (_, i) => ({ key: `unit-${i}` })), [block.capacity]);

  return (
    <div className="w-full h-full p-2 grid gap-1" style={{ gridTemplateColumns: `repeat(${block.side}, 1fr)` }}>
      {units.map((unit, index) => (
        <div
          key={unit.key}
          className={cn(
            "w-full h-full rounded-sm transition-colors duration-300",
            block.filledValue && index < block.filledValue ? 'bg-primary/80' : 'bg-muted/20'
          )}
        />
      ))}
    </div>
  );
};

const CubeMoldContent = ({ block }: { block: CubeMoldBlock }) => {
  const [rotation, setRotation] = useState({ x: -25, y: 35 });

  const handleRotate = (axis: 'x' | 'y', degrees: number) => {
    setRotation(prev => ({
      ...prev,
      [axis]: prev[axis] + degrees
    }));
  };
  
  const cubeContainerSize = 120;
  const side = block.side;
  const filledCount = block.filledValue || 0;
  
  const miniCubeSize = cubeContainerSize / side * 0.9;
  const gap = cubeContainerSize / side * 0.1;
  const totalSize = (miniCubeSize + gap) * side - gap;
  const centroidOffset = -totalSize / 2 + miniCubeSize / 2;

  const units = React.useMemo(() => {
    const arr = [];
    for (let z = 0; z < side; z++) {
      for (let y = 0; y < side; y++) {
        for (let x = 0; x < side; x++) {
          const index = z * side * side + y * side + x;
          const xPos = centroidOffset + x * (miniCubeSize + gap);
          const yPos = centroidOffset + y * (miniCubeSize + gap);
          const zPos = centroidOffset + z * (miniCubeSize + gap);

          arr.push({
            key: `unit-${index}`,
            isFilled: index < filledCount,
            style: {
              transform: `translateX(${xPos}px) translateY(${yPos}px) translateZ(${zPos}px)`,
            }
          });
        }
      }
    }
    return arr;
  }, [side, filledCount, miniCubeSize, gap, centroidOffset]);

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <div 
        className="w-full h-full flex items-center justify-center"
        style={{ perspective: '1200px' }}
      >
          <div
            className="cube"
            style={{
              width: `1px`,
              height: `1px`,
              transformStyle: 'preserve-3d',
              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
              transition: 'transform 0.5s ease-out',
            }}
          >
            {units.map(unit => (
              <div key={unit.key} className="absolute" style={{...unit.style, transformStyle: 'preserve-3d' }}>
                <div className="cube-face-mini" style={{ width: `${miniCubeSize}px`, height: `${miniCubeSize}px`, transform: `rotateY(0deg) translateZ(${miniCubeSize/2}px)`, backgroundColor: unit.isFilled ? 'hsl(var(--primary) / 0.7)' : 'hsl(var(--muted) / 0.20)' }}></div>
                <div className="cube-face-mini" style={{ width: `${miniCubeSize}px`, height: `${miniCubeSize}px`, transform: `rotateY(90deg) translateZ(${miniCubeSize/2}px)`, backgroundColor: unit.isFilled ? 'hsl(var(--primary) / 0.8)' : 'hsl(var(--muted) / 0.20)' }}></div>
                <div className="cube-face-mini" style={{ width: `${miniCubeSize}px`, height: `${miniCubeSize}px`, transform: `rotateY(180deg) translateZ(${miniCubeSize/2}px)`, backgroundColor: unit.isFilled ? 'hsl(var(--primary) / 0.7)' : 'hsl(var(--muted) / 0.20)' }}></div>
                <div className="cube-face-mini" style={{ width: `${miniCubeSize}px`, height: `${miniCubeSize}px`, transform: `rotateY(-90deg) translateZ(${miniCubeSize/2}px)`, backgroundColor: unit.isFilled ? 'hsl(var(--primary) / 0.8)' : 'hsl(var(--muted) / 0.20)' }}></div>
                <div className="cube-face-mini" style={{ width: `${miniCubeSize}px`, height: `${miniCubeSize}px`, transform: `rotateX(90deg) translateZ(${miniCubeSize/2}px)`, backgroundColor: unit.isFilled ? 'hsl(var(--primary) / 0.9)' : 'hsl(var(--muted) / 0.20)' }}></div>
                <div className="cube-face-mini" style={{ width: `${miniCubeSize}px`, height: `${miniCubeSize}px`, transform: `rotateX(-90deg) translateZ(${miniCubeSize/2}px)`, backgroundColor: unit.isFilled ? 'hsl(var(--primary) / 0.6)' : 'hsl(var(--muted) / 0.20)' }}></div>
              </div>
            ))}
          </div>
      </div>
      
      <Button variant="outline" size="icon" className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8" onClick={(e) => { e.stopPropagation(); handleRotate('x', -20); }}><ArrowUp className="w-5 h-5" /></Button>
      <Button variant="outline" size="icon" className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-8" onClick={(e) => { e.stopPropagation(); handleRotate('x', 20); }}><ArrowDown className="w-5 h-5" /></Button>
      <Button variant="outline" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8" onClick={(e) => { e.stopPropagation(); handleRotate('y', -20); }}><ArrowLeft className="w-5 h-5" /></Button>
      <Button variant="outline" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8" onClick={(e) => { e.stopPropagation(); handleRotate('y', 20); }}><ArrowRight className="w-5 h-5" /></Button>

    </div>
  );
}


const BlockComponent = React.memo(function BlockComponent({
  block,
  onClick,
  onDrop,
  onDelete,
  onDragStart,
  onDragEnd,
  onAbacusChange,
  onAbacusExport,
}: BlockProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("blockId", block.id);
    e.currentTarget.style.opacity = "0.4";
    e.currentTarget.style.transform = "scale(0.95)";
    onDragStart(e, block);
  };
  
  const handleDragEndLocal = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = "1";
    e.currentTarget.style.transform = "scale(1)";
    onDragEnd(e);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData("blockId");
    if (draggedId && draggedId !== block.id) {
      onDrop(draggedId, block.id);
    }
    handleDragEndLocal(e);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevents factoring when clicking to release a number from a mold
    if (block.type === 'mold' && block.filledById) {
      e.stopPropagation();
    }
    onClick(block.id);
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (block.type === 'abacus') return;
    onDelete(block.id);
  };
  
  const isPerfectFit = block.type === 'mold' && block.filledValue !== null && block.filledValue === block.capacity && block.surplus === 0;

  const blockSize = {
    cuadrado: { width: 280, height: 280 },
    cubo: { width: 280, height: 280 },
    abacus: { width: 320, height: 'auto' },
  }
  
  let size;
  if (block.type === 'mold') {
    size = blockSize[block.moldType];
  } else if (block.type === 'abacus') {
    size = blockSize.abacus;
  } else {
    size = { width: 150, height: 120 };
  }

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEndLocal}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={cn(
        "absolute flex items-center justify-center cursor-pointer active:cursor-grabbing rounded-2xl shadow-2xl transition-all duration-300 ease-in-out select-none group border-2",
        block.type !== 'abacus' && "hover:scale-105 hover:shadow-primary/40",
        {
          "bg-secondary text-secondary-foreground border-secondary backdrop-blur-sm": block.type === "simple",
          "bg-accent/80 text-accent-foreground border-accent backdrop-blur-sm": block.type === "product",
          "bg-primary/80 text-primary-foreground border-primary backdrop-blur-sm": block.type === "power",
          "bg-card/90 border-dashed border-border/50 hover:border-primary backdrop-blur-sm": block.type === "mold",
          "border-green-500 border-solid shadow-green-500/30": isPerfectFit,
          "bg-card/90 border-border/50 p-2": block.type === 'abacus'
        }
      )}
      style={{
        left: block.x,
        top: block.y,
        width: `${size.width}px`,
        height: size.height === 'auto' ? 'auto' : `${size.height}px`,
        transition: 'transform 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease, left 0.3s ease, top 0.3s ease, border-color 0.3s ease',
        animation: `bounce-in 0.5s ease-out`
      }}
    >
      <CardContent className="p-0 w-full h-full flex items-center justify-center relative">
        {block.type === 'mold' && block.moldType === 'cuadrado' 
          ? <SquareMoldContent block={block} />
          : block.type === 'mold' && block.moldType === 'cubo'
          ? <CubeMoldContent block={block} />
          : block.type === 'abacus' && onAbacusChange && onAbacusExport
          ? <AbacusComponent block={block} onChange={onAbacusChange} onExport={onAbacusExport} onDelete={onDelete}/>
          : block.type !== 'mold' && block.type !== 'abacus'
          ? <NumberBlockContent block={block as NumberBlock} />
          : null
        }
        {block.type === 'mold' && block.surplus > 0 && (
          <div className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-xs font-bold px-1.5 py-0.5 rounded-full z-10">
            +{block.surplus}
          </div>
        )}
      </CardContent>
      { block.type !== 'abacus' && (
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
          className="absolute top-2 right-2 w-7 h-7 bg-black/30 rounded-full flex items-center justify-center text-white/70 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/50 hover:text-white hover:scale-110 z-20"
          aria-label="Eliminar bloque"
        >
          {block.type === 'mold' && block.filledById ? <Minus className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      )}
    </Card>
  );
});

export default BlockComponent;
