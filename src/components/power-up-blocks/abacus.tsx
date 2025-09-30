import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download, X } from 'lucide-react';
import type { AbacusBlock } from '@/types/blocks';
import AbacusRowComponent from './abacus-row';

interface AbacusProps {
  block: AbacusBlock;
  onChange: (updatedBlock: AbacusBlock) => void;
  onExport: (blockId: string) => void;
  onDelete: (blockId: string) => void;
}

const beadColors = [
  'bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5',
  'bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'
];

const AbacusComponent: React.FC<AbacusProps> = ({ block, onChange, onExport, onDelete }) => {
  const handleAddRow = () => {
    const highestValue = block.rows.reduce((max, row) => Math.max(max, row.value), 0);
    // Find the next power of 10
    const nextPower = Math.pow(10, Math.floor(Math.log10(highestValue)) + 1);
    const newRowValue = highestValue === 0 ? 1 : nextPower;
    
    // Ensure no duplicate row values
    if (block.rows.some(row => row.value === newRowValue)) return;

    const newRow = { value: newRowValue, beads: 0 };
    const updatedRows = [...block.rows, newRow].sort((a, b) => a.value - b.value);
    onChange({ ...block, rows: updatedRows });
  };

  const handleBeadChange = (rowIndex: number, newBeads: number) => {
    const updatedRows = [...block.rows];
    updatedRows[rowIndex].beads = newBeads;
    onChange({ ...block, rows: updatedRows });
  };
  
  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    onExport(block.id);
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(block.id);
  }

  return (
    <div className="space-y-2 w-full" onClick={(e) => e.stopPropagation()}>
       <div className="flex items-center justify-between gap-1 w-full">
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={handleExport} title="Exportar valor">
          <Download className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 text-xs px-2" onClick={handleAddRow} title="Añadir fila (x10)">
          <Plus className="w-3 h-3 mr-1" /> Fila
        </Button>
        <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-destructive/20 hover:text-destructive" onClick={handleDelete} title="Eliminar ábaco">
            <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-1.5">
        {block.rows
            .slice()
            .sort((a, b) => b.value - a.value)
            .map((row, index) => (
                <AbacusRowComponent
                    key={row.value}
                    row={row}
                    color={beadColors[index % beadColors.length]}
                    onBeadChange={(newBeads) => handleBeadChange(block.rows.findIndex(r => r.value === row.value), newBeads)}
                />
        ))}
      </div>
    </div>
  );
};

export default AbacusComponent;
