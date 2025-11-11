"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Play } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Calculator, Copy, Divide, Box, Pointer, Plus, Zap } from 'lucide-react';

const WelcomeScreen = ({ onStart }: { onStart: (tutorial: boolean) => void }) => {
  const [particles, setParticles] = useState<React.CSSProperties[]>([]);
  const [isInstructionsOpen, setInstructionsOpen] = useState(false);

  useEffect(() => {
    // This code runs only on the client, after the component has mounted.
    const newParticles = Array.from({ length: 20 }).map(() => ({
      width: `${Math.random() * 80 + 20}px`,
      height: `${Math.random() * 80 + 20}px`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 20 + 15}s`,
      animationDelay: `-${Math.random() * 20}s`,
    }));
    setParticles(newParticles);
  }, []); // Empty dependency array ensures this runs once on mount.


  const instructionSections = [
    {
      title: "Bloques Numéricos",
      icon: <Plus className="w-5 h-5 text-primary" />,
      items: [
        "**Crear**: Escribe un número y pulsa \"Añadir Bloque\".",
        "**Multiplicar**: Arrastra un bloque sobre otro de distinto valor.",
        "**Potenciar**: Arrastra un bloque sobre otro del mismo valor.",
        "**Factorizar**: Haz clic en un bloque de producto o potencia para dividirlo.",
      ],
    },
    {
      title: "Moldes",
      icon: <Box className="w-5 h-5 text-primary" />,
      items: [
        "**Crear**: Elige un tipo (cuadrado/cubo) y tamaño, y añádelo.",
        "**Rellenar**: Arrastra un bloque numérico a un molde para ver si es un cuadrado o cubo perfecto.",
        "**Multiplicar**: Arrastra números a un molde ya lleno para multiplicar su valor.",
        "**Liberar**: Haz clic en la 'X' o en el molde para sacar el número.",
      ]
    },
    {
        title: "Ábaco",
        icon: <Calculator className="w-5 h-5 text-primary" />,
        items: [
            "**Sumar**: Arrastra un bloque numérico al ábaco para sumar su valor.",
            "**Acarreo**: Al llegar a 10 fichas, una se mueve a la fila superior (10¹, 10², etc.).",
            "**Exportar**: Pulsa el botón de exportar para crear un bloque con el total y limpiar el ábaco.",
        ]
    }
  ];

  return (
    <>
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm animate-fade-in p-4">
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((style, i) => (
            <div
              key={i}
              className="absolute bg-primary/10 rounded-lg animate-float"
              style={style}
            />
          ))}
        </div>
        
        <div className="text-center relative z-10 space-y-6">
          <h1 className="text-6xl md:text-8xl font-black text-primary animate-bounce-in" style={{ animationDelay: '0.2s' }}>
            Factorización con Bloques
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-bounce-in" style={{ animationDelay: '0.4s' }}>
            Un patio de juegos interactivo para explorar la belleza de los números, las potencias y los factores de una forma visual e intuitiva.
          </p>
          <div className="flex justify-center gap-4 animate-bounce-in" style={{ animationDelay: '0.6s' }}>
            <Button onClick={() => onStart(true)} variant="outline" size="lg" className="text-base font-semibold">
              <BookOpen className="mr-2" />
              Iniciar Tutorial
            </Button>
            <Button onClick={() => onStart(false)} size="lg" className="text-base font-semibold">
              <Play className="mr-2" />
              Iniciar
            </Button>
          </div>
        </div>
        <style jsx>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 0.8s ease-in-out forwards;
          }
        `}</style>
      </div>
    </>
  );
};

export default WelcomeScreen;

    