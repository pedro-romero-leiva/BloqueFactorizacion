import React from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AbacusRow } from '@/types/blocks';

interface AbacusRowProps {
  row: AbacusRow;
  color: string;
  onBeadChange: (newBeads: number) => void;
}

const AbacusRowComponent: React.FC<AbacusRowProps> = ({ row, color, onBeadChange }) => {
  const beads = Array.from({ length: 9 }, (_, i) => i < row.beads);

  const handleAdd = () => {
    if (row.beads < 9) {
      onBeadChange(row.beads + 1);
    } else {
      onBeadChange(10);
    }
  };

  const handleSubtract = () => {
    // Allow going to -1 temporarily to trigger borrow logic in the parent
    onBeadChange(row.beads - 1);
  };

  const exponent = Math.log10(row.value);

  return (
    <div className="flex items-center gap-1.5">
      <div className="font-mono text-xs w-10 text-right pr-1 text-muted-foreground">
        10<sup className="font-sans -top-1">{Number.isInteger(exponent) ? exponent : '?'}</sup>
      </div>
      <Button variant="outline" size="icon" className="w-6 h-6" onClick={handleSubtract}>
        <Minus className="w-3 h-3" />
      </Button>
      <div className="flex-1 grid grid-cols-9 gap-0.5 h-6 rounded-sm bg-muted/20 p-0.5">
        {beads.map((isFilled, index) => (
          <div key={index} className="flex items-center justify-center">
            <div
              className={cn('w-full h-full rounded-sm transition-all duration-200', isFilled ? color : 'bg-background/40')}
            />
          </div>
        ))}
      </div>
      <Button variant="outline" size="icon" className="w-6 h-6" onClick={handleAdd}>
        <Plus className="w-3 h-3" />
      </Button>
    </div>
  );
};

export default AbacusRowComponent;
