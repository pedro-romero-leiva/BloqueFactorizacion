"use client";

import { useState, useCallback, useRef } from "react";
import type { Block, PowerBlock, SimpleBlock, ProductBlock, MoldBlock, NumberBlock, MoldType, CubeMoldBlock, SquareMoldBlock, AbacusBlock, AbacusRow } from "@/types/blocks";
import { getFactors, isValidFactor } from "@/lib/math-utils";
import { useToast } from "@/hooks/use-toast";

import Canvas from "./canvas";
import Controls from "./controls";
import PerfectMold from './perfect-mold';
import AbacusTool from "./abacus-tool";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const GRID_SIZE = 20;

export default function PowerUpBlocks() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedBlock, setDraggedBlock] = useState<Block | null>(null);

  const [isBlocksPanelOpen, setBlocksPanelOpen] = useState(true);
  const [isMoldsPanelOpen, setMoldsPanelOpen] = useState(true);
  const [isAbacusPanelOpen, setAbacusPanelOpen] = useState(true);
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

  const getNextGridPosition = useCallback((baseX: number, baseY: number) => {
    return {
      x: Math.round(baseX / GRID_SIZE) * GRID_SIZE,
      y: Math.round(baseY / GRID_SIZE) * GRID_SIZE,
    }
  }, []);

  const handleAddBlock = useCallback(
    (value: number) => {
      const { x, y } = getNextGridPosition(
        Math.random() * ((canvasRef.current?.clientWidth ?? window.innerWidth) - 450),
        Math.random() * ((canvasRef.current?.clientHeight ?? window.innerHeight) - 220)
      );

      const newBlock: SimpleBlock = {
        id: `block-${Date.now()}`,
        type: "simple",
        value,
        x,
        y,
      };
      setBlocks((prev) => [...prev, newBlock]);
    },
    [getNextGridPosition]
  );

  const handleAddMold = useCallback((moldType: MoldType, side: number) => {
      const { x, y } = getNextGridPosition(
        Math.random() * ((canvasRef.current?.clientWidth ?? window.innerWidth) - 450),
        Math.random() * ((canvasRef.current?.clientHeight ?? window.innerHeight) - 220)
      );
    
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
          x,
          y,
        } as SquareMoldBlock;
      } else { // 'cubo'
        newMold = {
          id: `mold-${Date.now()}`,
          type: 'mold',
          moldType: 'cubo',
          side,
          side: side,
          capacity: side * side * side,
          filledById: null,
          filledValue: null,
          surplus: 0,
          x,
          y,
        } as CubeMoldBlock;
      }
      setBlocks((prev) => [...prev, newMold]);
  }, [getNextGridPosition]);

  const handleAddAbacus = useCallback(() => {
    const { x, y } = getNextGridPosition(
      Math.random() * ((canvasRef.current?.clientWidth ?? window.innerWidth) - 550),
      Math.random() * ((canvasRef.current?.clientHeight ?? window.innerHeight) - 320)
    );
    const newAbacus: AbacusBlock = {
      id: `abacus-${Date.now()}`,
      type: 'abacus',
      rows: [{ value: 1, beads: 0 }],
      x,
      y,
    };
    setBlocks(prev => [...prev, newAbacus]);
  }, [getNextGridPosition]);

  const handleAbacusChange = useCallback((updatedAbacus: AbacusBlock) => {
    let newRows = [...updatedAbacus.rows].sort((a, b) => a.value - b.value);
    
    // --- Borrowing logic (subtraction) ---
    let borrowNeeded = true;
    while (borrowNeeded) {
        borrowNeeded = false;
        const rowIndexToBorrow = newRows.findIndex(r => r.beads < 0);
        
        if (rowIndexToBorrow !== -1) {
            const totalValue = newRows.reduce((sum, r) => sum + (r.beads * r.value), 0);
            if (totalValue < 0) {
              // This prevents going into negative values. We revert the last change.
              newRows[rowIndexToBorrow].beads = 0;
              break; 
            }

            // Find the next highest row with beads to borrow from
            let sourceRowIndex = -1;
            for (let i = rowIndexToBorrow + 1; i < newRows.length; i++) {
                if (newRows[i].beads > 0) {
                    sourceRowIndex = i;
                    break;
                }
            }

            if (sourceRowIndex !== -1) {
                // Borrow down to the target row
                for (let i = sourceRowIndex; i > rowIndexToBorrow; i--) {
                    newRows[i].beads -= 1;
                    newRows[i-1].beads += 10;
                }
                borrowNeeded = true; // Check if more borrowing is needed
            } else {
                // Cannot borrow, revert change
                newRows[rowIndexToBorrow].beads = 0;
            }
        }
    }


    // --- Carry-over logic (addition) ---
    let carryNeeded = true;
    while (carryNeeded) {
        carryNeeded = false;
        newRows.forEach((row, index) => {
            if (row.beads >= 10) {
                carryNeeded = true;
                const carryAmount = Math.floor(row.beads / 10);
                const remainder = row.beads % 10;
                row.beads = remainder;

                if (index + 1 < newRows.length) {
                    newRows[index + 1].beads += carryAmount;
                } else {
                    const nextRowValue = row.value * 10;
                    newRows.push({ value: nextRowValue, beads: carryAmount });
                }
            }
        });
        if (carryNeeded) {
          newRows.sort((a, b) => a.value - b.value);
        }
    }
    
    setBlocks(prev => prev.map(b => b.id === updatedAbacus.id ? { ...updatedAbacus, rows: newRows } : b));
  }, []);

  const handleAbacusExport = useCallback((abacusId: string) => {
    const abacusBlock = blocks.find(b => b.id === abacusId) as AbacusBlock;
    if (!abacusBlock) return;

    const totalValue = abacusBlock.rows.reduce((sum, row) => sum + (row.beads * row.value), 0);

    if (totalValue <= 0) {
        toast({ title: "El ábaco está vacío", description: "Añade fichas para poder exportar un número." });
        return;
    }
    
    const { x, y } = getNextGridPosition(abacusBlock.x + 340, abacusBlock.y);

    const newBlock: SimpleBlock = {
      id: `block-${Date.now()}`,
      type: "simple",
      value: totalValue,
      x,
      y,
    };

    setBlocks((prev) => prev.map(b => 
        b.id === abacusId 
        ? { ...abacusBlock, rows: abacusBlock.rows.map(r => ({ ...r, beads: 0 })) }
        : b
    ).concat(newBlock));


  }, [blocks, getNextGridPosition, toast]);

  const releaseBlockFromMold = useCallback((moldId: string) => {
    setBlocks(prev => {
      const mold = prev.find(b => b.id === moldId) as MoldBlock | undefined;
      if (!mold || !mold.filledById) return prev;
      
      const value = mold.filledValue!;
      const { x, y } = getNextGridPosition(mold.x, mold.y);

      // Restore the original block, if it was complex. Otherwise, create a new simple one.
      const restoredBlockId = mold.filledById;
      const originalBlockExists = prev.some(b => b.id === restoredBlockId);

      let newBlock: NumberBlock | null = null;
      if (!originalBlockExists) {
        if (mold.originalBlockType === 'power' && mold.originalBlockState) {
          newBlock = {
            ...(mold.originalBlockState as PowerBlock),
            id: restoredBlockId,
            x, y,
          };
        } else if (mold.originalBlockType === 'product' && mold.originalBlockState) {
          newBlock = {
            ...(mold.originalBlockState as ProductBlock),
            id: restoredBlockId,
            x, y,
          };
        } else {
          newBlock = {
            id: restoredBlockId,
            type: 'simple',
            value,
            x, y,
          };
        }
      }

      const updatedBlocks = prev.map(b => 
        b.id === moldId 
        ? { ...b, filledById: null, filledValue: null, surplus: 0, originalBlockType: undefined, originalBlockState: undefined } 
        : b
      );
      
      if (newBlock) {
        updatedBlocks.push(newBlock);
      }
      
      return updatedBlocks;
    });
  }, [getNextGridPosition]);
  
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
      
      if (block.type === 'abacus') {
        return;
      }

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
      
      // Consume block into Abacus
      if (dragged.type !== 'abacus' && target.type === 'abacus') {
        const numberBlock = dragged as NumberBlock;
        const abacusBlock = target as AbacusBlock;
        
        const currentValue = abacusBlock.rows.reduce((sum, row) => sum + (row.beads * row.value), 0);
        let newValue = currentValue + numberBlock.value;

        // Ensure we have enough rows to represent the new value
        const newRows: AbacusRow[] = [...abacusBlock.rows].map(r => ({ ...r, beads: 0 }));
        let maxPlaceValue = newRows.reduce((max, row) => Math.max(max, row.value), 0);
        while (maxPlaceValue < newValue && newValue > 0) {
            maxPlaceValue *= 10;
            if (maxPlaceValue === 0) maxPlaceValue = 1;
            if (!newRows.some(r => r.value === maxPlaceValue)) {
                newRows.push({ value: maxPlaceValue, beads: 0 });
            }
        }
        newRows.sort((a,b) => a.value - b.value);

        // Deconstruct the new value into beads
        for (let i = newRows.length - 1; i >= 0; i--) {
            const row = newRows[i];
            if (newValue >= row.value) {
                const beads = Math.floor(newValue / row.value);
                row.beads = beads;
                newValue %= row.value;
            }
        }
        
        const finalRows = newRows.length > 0 ? newRows.sort((a,b) => a.value - b.value) : [{ value: 1, beads: 0 }];

        const updatedAbacus: AbacusBlock = { ...abacusBlock, rows: finalRows };

        setBlocks(prev => prev
            .filter(b => b.id !== draggedId) // consume block
            .map(b => b.id === abacusBlock.id ? updatedAbacus : b)
        );
        handleAbacusChange(updatedAbacus); // Trigger carry-over check
        return;
      }

      // Handle dropping a number block into a mold
      if (dragged.type !== 'mold' && dragged.type !== 'abacus' && target.type === 'mold') {
        const numberBlock = dragged as NumberBlock;
        const moldBlock = target as MoldBlock;

        // Multiply if mold already has a value
        if (moldBlock.filledValue !== null && moldBlock.filledValue > 0) {
          const newValue = moldBlock.filledValue * numberBlock.value;
          const surplus = Math.max(0, newValue - moldBlock.capacity);
          
          setBlocks(prev => prev
            .filter(b => b.id !== draggedId) // consume dragged block
            .map(b => b.id === targetId ? {
              ...moldBlock,
              filledValue: newValue,
              surplus: surplus,
              // We lose the original block type info on multiplication
              originalBlockType: 'product',
              originalBlockState: undefined,
            } : b)
          );
          return;
        }

        // Fill if mold is empty
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

      // Don't combine molds with anything, or abacus with numbers
      if (dragged.type === 'mold' || target.type === 'mold' || dragged.type === 'abacus' || target.type === 'abacus') return;

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
    [blocks, toast, handleAbacusChange]
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


  const arePanelsOpen = isBlocksPanelOpen || isMoldsPanelOpen || isAbacusPanelOpen;

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <div 
        className={cn(
            "flex-shrink-0 bg-card/80 backdrop-blur-sm border-r border-border/50 flex flex-col transition-all duration-300",
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
        <AbacusTool
          onAddAbacus={handleAddAbacus}
          isOpen={isAbacusPanelOpen}
          onToggle={() => setAbacusPanelOpen(prev => !prev)}
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
          onAbacusChange={handleAbacusChange}
          onAbacusExport={handleAbacusExport}
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
