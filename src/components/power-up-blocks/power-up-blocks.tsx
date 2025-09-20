"use client";

import { useState, useCallback, useRef } from "react";
import type { Block, PowerBlock, SimpleBlock, ProductBlock, MoldBlock, NumberBlock, MoldType, CubeMoldBlock, SquareMoldBlock } from "@/types/blocks";
import { getFactors, isValidFactor } from "@/lib/math-utils";
import { useToast } from "@/hooks/use-toast";

import Canvas from "./canvas";
import Controls from "./controls";
import PerfectMold from './perfect-mold';
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PowerUpBlocks() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedBlock, setDraggedBlock] = useState<Block | null>(null);

  const [isBlocksPanelOpen, setBlocksPanelOpen] = useState(true);
  const [isMoldsPanelOpen, setMoldsPanelOpen] = useState(true);
  const [factorMode, setFactorMode] = useState<'AUTOMATICO' | 'MANUAL'>('MANUAL');
  
  const [factoringModalState, setFactoringModalState] = useState<{
    isOpen: boolean;
    block: NumberBlock | null;
    customFactor: string;
  }>({
    isOpen: false,
    block: null,
    customFactor: '',
  });

  const handleAddBlock = useCallback(
    (value: number) => {
      const newBlock: SimpleBlock = {
        id: `block-${Date.now()}`,
        type: "simple",
        value,
        x: Math.random() * ( (canvasRef.current?.clientWidth ?? window.innerWidth) - 450),
        y: Math.random() * ((canvasRef.current?.clientHeight ?? window.innerHeight) - 220),
      };
      setBlocks((prev) => [...prev, newBlock]);
    },
    []
  );

  const handleAddMold = useCallback((moldType: MoldType, side: number) => {
      let newMold: MoldBlock;
      if (moldType === 'cuadrado') {
        newMold = {
          id: `mold-${Date.now()}`,
          type: 'mold',
          moldType: 'cuadrado',
          side,
          capacity: side * side,
          filledById: null,
          filledValue: null,
          surplus: 0,
          x: Math.random() * ( (canvasRef.current?.clientWidth ?? window.innerWidth) - 450),
          y: Math.random() * ((canvasRef.current?.clientHeight ?? window.innerHeight) - 220),
        } as SquareMoldBlock;
      } else { // 'cubo'
        newMold = {
          id: `mold-${Date.now()}`,
          type: 'mold',
          moldType: 'cubo',
          side,
          capacity: side * side * side,
          filledById: null,
          filledValue: null,
          surplus: 0,
          x: Math.random() * ( (canvasRef.current?.clientWidth ?? window.innerWidth) - 450),
          y: Math.random() * ((canvasRef.current?.clientHeight ?? window.innerHeight) - 220),
        } as CubeMoldBlock;
      }
      setBlocks((prev) => [...prev, newMold]);
  }, []);

  const releaseBlockFromMold = useCallback((moldId: string) => {
    setBlocks(prev => {
      const mold = prev.find(b => b.id === moldId) as MoldBlock | undefined;
      if (!mold || !mold.filledById) return prev;

      const originalBlock = prev.find(b => b.id === mold.filledById);
      if (originalBlock) return prev; // Block already exists, something is wrong.
      
      const value = mold.filledValue!;

      // Find the original block type to restore it correctly
      let originalType: NumberBlock['type'] = 'simple';
      if (mold.originalBlockType === 'power') originalType = 'power';
      if (mold.originalBlockType === 'product') originalType = 'product';

      let newBlock: NumberBlock;

      if (originalType === 'power' && mold.originalBlockState) {
        newBlock = {
          ...mold.originalBlockState as PowerBlock,
          id: mold.filledById,
          x: mold.x,
          y: mold.y,
        };
      } else if (originalType === 'product' && mold.originalBlockState) {
        newBlock = {
          ...mold.originalBlockState as ProductBlock,
          id: mold.filledById,
          x: mold.x,
          y: mold.y,
        };
      } else {
        newBlock = {
          id: mold.filledById,
          type: 'simple',
          value,
          x: mold.x,
          y: mold.y,
        };
      }


      return prev.map(b => 
        b.id === moldId 
        ? { ...b, filledById: null, filledValue: null, surplus: 0, originalBlockType: undefined, originalBlockState: undefined } 
        : b
      ).concat(newBlock);
    });
  }, []);
  
  const factorBlock = useCallback((block: NumberBlock, factors?: [number, number]) => {
      const factorsToUse = factors || getFactors(block.value);

      if (!factorsToUse) {
        toast({
          variant: "destructive",
          title: "Número Primo",
          description: `${block.value} es un número primo y no se puede factorizar más.`,
        });
        return;
      }

      const [factor1, factor2] = factorsToUse;
      const newBlock1: SimpleBlock = {
        id: `block-${Date.now()}-1`,
        type: "simple",
        value: factor1,
        x: block.x - 80,
        y: block.y + 130,
      };
      const newBlock2: SimpleBlock = {
        id: `block-${Date.now()}-2`,
        type: "simple",
        value: factor2,
        x: block.x + 80,
        y: block.y + 130,
      };

      setBlocks((prev) => [
        ...prev.filter((b) => b.id !== block.id),
        newBlock1,
        newBlock2,
      ]);
  }, [toast]);

  const handleManualFactor = useCallback(() => {
    const { block, customFactor } = factoringModalState;
    const factorNum = parseInt(customFactor, 10);
    
    if (!block) return;

    if (!isValidFactor(block.value, factorNum)) {
      toast({
        variant: "destructive",
        title: "Factor no válido",
        description: `${factorNum} no es un divisor válido de ${block.value}.`,
      });
      return;
    }
    
    const otherFactor = block.value / factorNum;
    factorBlock(block, [factorNum, otherFactor]);

    setFactoringModalState({ isOpen: false, block: null, customFactor: '' });

  }, [factoringModalState, factorBlock, toast]);

  const handleBlockClick = useCallback(
    (blockId: string) => {
      const block = blocks.find((b) => b.id === blockId);
      if (!block) return;

      if (block.type === 'mold') {
        if (block.filledById) {
          releaseBlockFromMold(blockId);
        }
        return;
      }
      
      const numberBlock = block as NumberBlock;

      if (factorMode === 'MANUAL') {
        if (getFactors(numberBlock.value) === null) {
          toast({
            variant: "destructive",
            title: "Número Primo",
            description: `${numberBlock.value} es un número primo y no se puede factorizar.`,
          });
          return;
        }
        setFactoringModalState({ isOpen: true, block: numberBlock, customFactor: '' });
        return;
      }

      // AUTOMATIC mode logic
      if (numberBlock.type === "product") {
        const [factor1, factor2] = numberBlock.factors;
        const newBlock1: SimpleBlock = {
          id: `block-${Date.now()}-1`,
          type: "simple",
          value: factor1,
          x: numberBlock.x - 80,
          y: numberBlock.y + 130,
        };
        const newBlock2: SimpleBlock = {
          id: `block-${Date.now()}-2`,
          type: "simple",
          value: factor2,
          x: numberBlock.x + 80,
          y: numberBlock.y + 130,
        };
        setBlocks((prev) => [
          ...prev.filter((b) => b.id !== blockId),
          newBlock1,
          newBlock2,
        ]);
        return;
      }
      
      if (numberBlock.type === "power") {
        if (numberBlock.exponent <= 1) return;

        const newBlock1: PowerBlock | SimpleBlock =
          numberBlock.exponent - 1 === 1
            ? {
                id: `block-${Date.now()}-1`,
                type: 'simple',
                value: numberBlock.base,
                x: numberBlock.x - 80,
                y: numberBlock.y + 130,
              }
            : {
                id: `block-${Date.now()}-1`,
                type: 'power',
                base: numberBlock.base,
                exponent: numberBlock.exponent - 1,
                value: Math.pow(numberBlock.base, numberBlock.exponent - 1),
                x: numberBlock.x - 80,
                y: numberBlock.y + 130,
              };

        const newBlock2: SimpleBlock = {
          id: `block-${Date.now()}-2`,
          type: 'simple',
          value: numberBlock.base,
          x: numberBlock.x + 80,
          y: numberBlock.y + 130,
        };
        
        setBlocks((prev) => [
          ...prev.filter((b) => b.id !== blockId),
          newBlock1,
          newBlock2,
        ]);
        return;
      }

      factorBlock(numberBlock);
    },
    [blocks, toast, releaseBlockFromMold, factorMode, factorBlock]
  );

  const handleCombineBlocks = useCallback(
    (draggedId: string, targetId: string) => {
      const dragged = blocks.find((b) => b.id === draggedId);
      const target = blocks.find((b) => b.id === targetId);

      if (!dragged || !target) return;

      // Handle dropping a number block into a mold
      if (dragged.type !== 'mold' && target.type === 'mold') {
        const numberBlock = dragged as NumberBlock;
        const moldBlock = target as MoldBlock;

        if (moldBlock.filledById) {
          toast({ variant: 'destructive', title: 'Molde Ocupado', description: 'Este molde ya tiene un número. Haz clic para liberarlo.' });
          return;
        }

        const surplus = Math.max(0, numberBlock.value - moldBlock.capacity);
        
        setBlocks(prev => prev
          .filter(b => b.id !== draggedId)
          .map(b => b.id === targetId ? {
            ...moldBlock,
            filledById: numberBlock.id,
            filledValue: numberBlock.value,
            surplus: surplus,
            originalBlockType: numberBlock.type,
            originalBlockState: numberBlock.type !== 'simple' ? numberBlock : undefined,
          } : b)
        );

        return;
      }

      // Don't combine molds with anything
      if (dragged.type === 'mold' || target.type === 'mold') return;

      // Existing combine logic for number blocks
      const draggedBlock = dragged as NumberBlock;
      const targetBlock = target as NumberBlock;

      const remainingBlocks = blocks.filter(
        (b) => b.id !== draggedId && b.id !== targetId
      );

      const draggedBase = draggedBlock.type === 'power' ? draggedBlock.base : draggedBlock.value;
      const targetBase = targetBlock.type === 'power' ? targetBlock.base : targetBlock.value;

      // Same Base -> Power
      if (draggedBase === targetBase) {
        const base = draggedBase;
        
        const draggedExponent = draggedBlock.type === 'power' ? draggedBlock.exponent : 1;
        const targetExponent = targetBlock.type === 'power' ? targetBlock.exponent : 1;
        
        const exponent = draggedExponent + targetExponent;

        const newBlock: PowerBlock = {
          id: `block-${Date.now()}`,
          type: "power",
          base,
          exponent,
          value: Math.pow(base, exponent),
          x: targetBlock.x,
          y: targetBlock.y,
        };
        setBlocks([...remainingBlocks, newBlock]);
      }
      // Different Value -> Multiplication
      else {
        const value = draggedBlock.value * targetBlock.value;
        const newBlock: ProductBlock = {
          id: `block-${Date.now()}`,
          type: "product",
          factors: [draggedBlock.value, targetBlock.value],
          value,
          x: targetBlock.x,
          y: targetBlock.y,
        };
        setBlocks([...remainingBlocks, newBlock]);
      }
    },
    [blocks, toast]
  );

  const handleBlockMove = useCallback((blockId: string, x: number, y: number) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, x, y } : b))
    );
  }, []);
  
  const handleBlockDelete = useCallback((blockId: string) => {
     const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    
    if (block.type === 'mold' && block.filledById) {
      releaseBlockFromMold(blockId);
      return;
    }
    
    setBlocks(prev => prev.filter(b => b.id !== blockId));
  }, [blocks, releaseBlockFromMold]);

  const handleBlockDragStart = useCallback((_e: React.DragEvent<HTMLDivElement>, block: Block) => {
    setDraggedBlock(block);
  }, []);

  const handleBlockDragEnd = useCallback(() => {
    setDraggedBlock(null);
  }, []);


  const arePanelsOpen = isBlocksPanelOpen || isMoldsPanelOpen;

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <div 
        className={cn(
            "flex-shrink-0 bg-card/50 backdrop-blur-sm border-r border-border/50 flex flex-col transition-all duration-300",
            arePanelsOpen ? "w-full md:w-[400px]" : "w-auto"
        )}>
        <Controls 
          onAddBlock={handleAddBlock}
          isOpen={isBlocksPanelOpen}
          onToggle={() => setBlocksPanelOpen(prev => !prev)}
          factorMode={factorMode}
          onFactorModeChange={setFactorMode}
        />
        <PerfectMold
          onAddMold={handleAddMold}
          isOpen={isMoldsPanelOpen}
          onToggle={() => setMoldsPanelOpen(prev => !prev)}
        />
      </div>
      <div className="flex-1 relative" ref={canvasRef}>
        <Canvas
          blocks={blocks}
          onBlockClick={handleBlockClick}
          onCombineBlocks={handleCombineBlocks}
          onBlockMove={handleBlockMove}
          onBlockDelete={handleBlockDelete}
          onBlockDragStart={handleBlockDragStart}
          onBlockDragEnd={handleBlockDragEnd}
        />
      </div>
      
      <AlertDialog open={factoringModalState.isOpen} onOpenChange={(isOpen) => setFactoringModalState(prev => ({...prev, isOpen}))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dividir Bloque Manualmente</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Por cuál número quieres dividir el bloque de {factoringModalState.block?.value}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
              <Label htmlFor="custom-factor">Ingresa un divisor válido</Label>
              <Input
                id="custom-factor"
                type="number"
                value={factoringModalState.customFactor}
                onChange={(e) => setFactoringModalState(prev => ({...prev, customFactor: e.target.value}))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleManualFactor();
                  }
                }}
                autoFocus
              />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleManualFactor}>Dividir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
