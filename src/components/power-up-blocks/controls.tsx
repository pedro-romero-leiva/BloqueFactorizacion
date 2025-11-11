"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";


const formSchema = z.object({
  number: z.coerce
    .number({ invalid_type_error: "Debe ser un número" })
    .int()
    .min(1, { message: "Debe ser > 0" }),
});

type FormValues = z.infer<typeof formSchema>;

interface ControlsProps {
  onAddBlock: (value: number) => void;
  isOpen: boolean;
  onToggle: () => void;
  factorMode: 'AUTOMATICO' | 'MANUAL';
  onFactorModeChange: (mode: 'AUTOMATICO' | 'MANUAL') => void;
}

export default function Controls({
  onAddBlock,
  isOpen,
  onToggle,
  factorMode,
  onFactorModeChange,
}: ControlsProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      number: 2,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    onAddBlock(data.number);
    form.resetField("number");
  };

  return (
    <div className={cn("p-4 md:p-6 transition-all duration-300", !isOpen && "p-2 md:p-3")}>
        <header 
            className="flex items-center justify-between gap-3"
        >
            <div className="flex items-center gap-3 cursor-pointer" onClick={onToggle}>
                <div className={cn("bg-primary/20 text-primary p-3 rounded-xl shadow-lg transition-all duration-300", !isOpen && "p-2 bg-transparent shadow-none")}>
                    <Zap className={cn("w-8 h-8 transition-all duration-300", !isOpen && "w-6 h-6")} />
                </div>
                <div className={cn("transition-all duration-300 overflow-hidden", isOpen ? "w-auto opacity-100" : "w-0 opacity-0")}>
                    <h1 className="text-2xl font-bold text-foreground whitespace-nowrap">Bloques</h1>
                    <p className="text-muted-foreground text-sm whitespace-nowrap">Añade números</p>
                </div>
            </div>
            
            <div className={cn("flex flex-col items-center gap-1 transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")}>
                <Label htmlFor="factor-mode" className="text-xs text-muted-foreground">Factorización</Label>
                <Switch
                    id="factor-mode"
                    checked={factorMode === 'MANUAL'}
                    onCheckedChange={(checked) => onFactorModeChange(checked ? 'MANUAL' : 'AUTOMATICO')}
                    aria-label="Cambiar modo de factorización"
                    className="h-5 w-10 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                    thumbClassName="h-4 w-4 data-[state=checked]:translate-x-5"
                />
                <span className="text-xs font-semibold text-primary">{factorMode}</span>
            </div>
        </header>

      {isOpen && (
        <div className="mt-6 space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Ingresa un número</FormLabel>
                      <FormControl>
                          <Input
                          type="number"
                          placeholder="ej., 5"
                          {...field}
                          autoComplete="off"
                          className="text-base"
                          />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
                  <Button type="submit" className="w-full text-base font-semibold group" size="lg">
                  <Plus className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-90" /> Añadir Bloque
                  </Button>
              </form>
            </Form>
        </div>
      )}
    </div>
  );
}
