"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { BookOpen, Play, PlusSquare, Zap, X, Move, Box, Rotate3d, Calculator } from 'lucide-react';

const WelcomeScreen = ({ onStart }: { onStart: () => void }) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [particles, setParticles] = useState<React.CSSProperties[]>([]);

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


  return (
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
          <AlertDialog open={showInstructions} onOpenChange={setShowInstructions}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="lg" className="text-base font-semibold">
                <BookOpen className="mr-2" />
                Instrucciones
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl flex items-center gap-3"><BookOpen className="w-8 h-8 text-primary"/>¿Cómo usar la aplicación?</AlertDialogTitle>
                <AlertDialogDescription asChild>
                    <div className="text-left space-y-4 pt-4 text-base text-foreground/80 max-h-[60vh] overflow-y-auto pr-4">
                      <ul className="space-y-4">
                        <li className="flex items-start gap-4">
                          <PlusSquare className="w-6 h-6 mt-1 text-primary flex-shrink-0" />
                          <div><strong>Crear Bloques:</strong> Escribe un número en el panel izquierdo y presiona el botón '+' para añadir bloques numéricos al lienzo.</div>
                        </li>
                        <li className="flex items-start gap-4">
                          <Zap className="w-6 h-6 mt-1 text-primary flex-shrink-0" />
                          <div><strong>Crear Potencias:</strong> Arrastra un bloque sobre otro con el <strong>mismo valor</strong> para combinarlos en una potencia (Ej: 3 sobre 3 = 3²).</div>
                        </li>
                        <li className="flex items-start gap-4">
                          <X className="w-6 h-6 mt-1 text-primary flex-shrink-0" />
                          <div><strong>Multiplicar:</strong> Arrastra un bloque sobre otro de <strong>diferente valor</strong> para multiplicarlos y crear un producto (Ej: 3 sobre 5 = 15).</div>
                        </li>
                        <li className="flex items-start gap-4">
                          <Move className="w-6 h-6 mt-1 text-primary flex-shrink-0" />
                          <div><strong>Factorizar:</strong> Haz clic en cualquier bloque numérico para dividirlo. Usa el toggle <span className="font-semibold text-primary">Manual/Automático</span> para elegir cómo factorizar.</div>
                        </li>
                        <li className="flex items-start gap-4">
                          <Box className="w-6 h-6 mt-1 text-primary flex-shrink-0" />
                          <div><strong>Moldes Perfectos:</strong> Crea moldes y arrastra un número sobre ellos para ver si es un cuadrado o cubo perfecto, o para realizar multiplicaciones en cadena.</div>
                        </li>
                        <li className="flex items-start gap-4">
                          <Rotate3d className="w-6 h-6 mt-1 text-primary flex-shrink-0" />
                          <div><strong>Rotar Cubos 3D:</strong> Cuando llenes un molde de cubo, usa las flechas para rotarlo y explorar su estructura tridimensional.</div>
                        </li>
                        <li className="flex items-start gap-4">
                          <Calculator className="w-6 h-6 mt-1 text-primary flex-shrink-0" />
                          <div>
                            <strong>Ábaco / Contador:</strong>
                            <ul className="list-disc pl-5 mt-2 space-y-2 text-sm">
                                <li>Usa los botones <strong>+/-</strong> en cada fila para añadir o quitar fichas. Las filas representan potencias: 10⁰, 10¹, 10², etc.</li>
                                <li>Arrastra un número al ábaco para <strong>sumar</strong> su valor al total.</li>
                                <li>Haz clic en el icono de descarga para <strong>Exportar</strong> un bloque con el valor actual, lo que limpiará el ábaco.</li>
                                <li>Al añadir o restar fichas, se realiza un <strong>acarreo o préstamo automático</strong> entre las filas.</li>
                            </ul>
                          </div>
                        </li>
                      </ul>
                      <p className="font-semibold text-center pt-4">¡Explora, experimenta y redescubre las matemáticas!</p>
                    </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setShowInstructions(false)}>¡Entendido!</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={onStart} size="lg" className="text-base font-semibold">
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
  );
};

export default WelcomeScreen;
