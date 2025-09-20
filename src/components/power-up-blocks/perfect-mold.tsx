"use client";
import { useState } from "react";
import { Box as BoxIcon, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { MoldType } from "@/types/blocks";
import { cn } from "@/lib/utils";

interface PerfectMoldProps {
  onAddMold: (moldType: MoldType, side: number) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function PerfectMold({ onAddMold, isOpen, onToggle }: PerfectMoldProps) {
  const [moldType, setMoldType] = useState<MoldType>("cuadrado");
  const [side, setSide] = useState(4);

  const handleAddClick = () => {
    onAddMold(moldType, side);
  }

  return (
    <div className={cn("p-4 md:p-6 border-t border-border transition-all duration-300", !isOpen && "p-2 md:p-3")}>
        <header 
            className="flex items-center gap-3 cursor-pointer"
            onClick={onToggle}
        >
            <div className={cn("bg-accent/20 text-accent p-3 rounded-xl shadow-lg transition-all duration-300", !isOpen && "p-2 bg-transparent shadow-none")}>
                <BoxIcon className={cn("w-8 h-8 transition-all duration-300", !isOpen && "w-6 h-6")} />
            </div>
            <div className={cn("transition-all duration-300 overflow-hidden", isOpen ? "w-full opacity-100" : "w-0 opacity-0")}>
                <h2 className="text-2xl font-bold text-foreground whitespace-nowrap">Moldes</h2>
                <p className="text-muted-foreground text-sm whitespace-nowrap">Crea formas</p>
            </div>
        </header>

      {isOpen && (
        <div className="mt-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <Label htmlFor="mold-type">Tipo de Molde</Label>
                    <Select value={moldType} onValueChange={(v) => setMoldType(v as MoldType)}>
                    <SelectTrigger id="mold-type">
                        <SelectValue placeholder="Selecciona un molde" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="cuadrado">Cuadrado (2D)</SelectItem>
                        <SelectItem value="cubo">Cubo (3D)</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="side-size">Tamaño del Lado</Label>
                    <Input
                    id="side-size"
                    type="number"
                    value={side}
                    onChange={(e) => setSide(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max="10"
                    className="text-base"
                    />
                </div>
            </div>
            
            <Button onClick={handleAddClick} size="lg" className="w-full text-base font-semibold group text-white">
                <Plus className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-90" /> Añadir Molde
            </Button>
        </div>
      )}
    </div>
  );
}
