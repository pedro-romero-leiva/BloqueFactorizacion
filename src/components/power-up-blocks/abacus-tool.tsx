"use client";

import { Plus } from "lucide-react";
import { Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

interface AbacusToolProps {
  onAddAbacus: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function AbacusTool({ onAddAbacus, isOpen, onToggle }: AbacusToolProps) {

  return (
    <div data-testid="abacus-panel" className={cn("p-4 md:p-6 border-t border-border transition-all duration-300", !isOpen && "p-2 md:p-3")}>
        <header 
            className="flex items-center gap-3 cursor-pointer"
            onClick={onToggle}
        >
            <div className={cn("bg-green-500/20 text-green-500 p-3 rounded-xl shadow-lg transition-all duration-300", !isOpen && "p-2 bg-transparent shadow-none")}>
                <Calculator className={cn("w-8 h-8 transition-all duration-300", !isOpen && "w-6 h-6")} />
            </div>
            <div className={cn("transition-all duration-300 overflow-hidden", isOpen ? "w-full opacity-100" : "w-0 opacity-0")}>
                <h2 className="text-2xl font-bold text-foreground whitespace-nowrap">Ábaco</h2>
                <p className="text-muted-foreground text-sm whitespace-nowrap">Contador visual</p>
            </div>
        </header>

      {isOpen && (
        <div className="mt-6">
            <Button id="tutorial-add-abacus-btn" onClick={onAddAbacus} size="lg" className="w-full text-base font-semibold group text-white">
                <Plus className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-90" /> Añadir Ábaco
            </Button>
        </div>
      )}
    </div>
  );
}
