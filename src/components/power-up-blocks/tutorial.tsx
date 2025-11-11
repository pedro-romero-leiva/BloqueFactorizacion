"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const tutorialSteps = [
  {
    id: 1,
    elementId: 'tutorial-blocks-panel',
    title: '¡Bienvenido! 👋',
    description: 'Esta herramienta te ayuda a aprender sobre potencias y multiplicación. ¡Vamos a explorarla!',
    type: 'info',
    action: null
  },
  {
    id: 2,
    elementId: 'tutorial-number-input',
    title: '2. Escribe un número aquí ✏️',
    description: 'En este campo puedes escribir cualquier número. Escribe el número 5.',
    type: 'action',
    action: 'input-number',
    waitFor: 'number-entered',
  },
  { 
    id: 3,
    elementId: 'tutorial-add-block-btn',
    title: '3. Crea tu primer bloque',
    description: 'Perfecto. Ahora haz clic en el botón "Añadir Bloque".',
    type: 'action',
    action: 'add-block',
    waitFor: 'block-created'
  },
  {
    id: 4,
    elementId: 'canvas',
    title: '¡Genial! 🎉',
    description: 'Mira, apareció un bloque con el número 5. Puedes moverlo arrastrándolo con el mouse. ¡Pruébalo!',
    type: 'action',
    action: 'drag-block',
    waitFor: 'block-dragged'
  },
  {
    id: 5,
    elementId: 'tutorial-number-input',
    title: '4. Escribe otro número',
    description: 'Ahora escribe el número 3 en el campo.',
    type: 'action',
    action: 'input-number',
    waitFor: 'number-entered'
  },
  {
    id: 6,
    elementId: 'tutorial-add-block-btn',
    title: '5. Crea el segundo bloque',
    description: 'Haz clic en "Añadir Bloque" para crear el bloque con el número 3.',
    type: 'action',
    action: 'add-block',
    waitFor: 'block-created',
    requiredCount: 2
  },
  {
    id: 7,
    elementId: 'canvas',
    title: '6. Une los bloques',
    description: 'Arrastra un bloque sobre otro para unirlos. Si son diferentes, se multiplican. ¡Inténtalo!',
    type: 'action',
    action: 'merge-blocks',
    waitFor: 'blocks-merged'
  },
    {
    id: 8,
    elementId: 'canvas',
    title: '7. Factoriza un bloque',
    description: 'Haz clic en un bloque que sea producto de una multiplicación (como el 15) para dividirlo en sus factores originales.',
    type: 'action',
    action: 'factor-block',
    waitFor: 'block-factored'
  },
  {
    id: 9,
    elementId: 'tutorial-molds-panel',
    title: '8. Conoce los Moldes 📦',
    description: 'Los moldes te ayudan a organizar bloques en formas geométricas. ¡Vamos a crear uno!',
    type: 'info'
  },
  {
    id: 10,
    elementId: 'tutorial-mold-type',
    title: '9. Elige el tipo de molde',
    description: 'Aquí puedes elegir entre Cuadrado (2D) o Cubo (3D). Deja seleccionado "Cuadrado (2D)".',
    type: 'info'
  },
  {
    id: 11,
    elementId: 'tutorial-mold-size',
    title: '10. Define el tamaño ✏️',
    description: 'Escribe el número 4 para crear un molde de 4x4 (16 bloques en total).',
    type: 'action',
    action: 'input-mold-size',
    waitFor: 'mold-size-entered'
  },
  {
    id: 12,
    elementId: 'tutorial-add-mold-btn',
    title: '11. Crea el molde',
    description: 'Haz clic en "Añadir Molde" para crear tu molde en el lienzo.',
    type: 'action',
    action: 'create-mold',
    waitFor: 'mold-created'
  },
  {
    id: 13,
    elementId: 'canvas',
    title: '12. Usa tu molde 🎯',
    description: '¡Excelente! Ahora puedes arrastrar bloques dentro del molde para ver cómo se llenan las casillas.',
    type: 'action',
    action: 'place-block-in-mold',
    waitFor: 'block-placed-in-mold'
  },
  {
    id: 14,
    elementId: 'tutorial-abacus-panel',
    title: '13. Conoce el Ábaco 🧮',
    description: 'El Ábaco es un contador visual que te permite sumar valores de forma interactiva.',
    type: 'info'
  },
  {
    id: 15,
    elementId: 'tutorial-add-abacus-btn',
    title: '14. Añade un Ábaco',
    description: 'Haz clic en "Añadir Ábaco" para crear un contador en el lienzo.',
    type: 'action',
    action: 'add-abacus',
    waitFor: 'abacus-created'
  },
  {
    id: 16,
    elementId: 'canvas',
    title: '15. El Ábaco suma por ti 📊',
    description: 'Arrastra un bloque numérico al ábaco para sumar su valor. ¡Pruébalo!',
    type: 'info'
  },
  {
    id: 17,
    elementId: 'tutorial-blocks-panel',
    title: '¡Felicidades! 🎉🎊',
    description: 'Has completado el tutorial y aprendido a usar todas las herramientas. ¡Ahora puedes explorar y crear lo que imagines!',
    type: 'info'
  }
];


export default function Tutorial({ onExit }: { onExit: () => void }) {
  const [step, setStep] = useState(0);
  const currentStep = tutorialSteps[step];
  
  const [tooltipStyle, setTooltipStyle] = useState({});
  const [highlightStyle, setHighlightStyle] = useState({});

  useEffect(() => {
    if (typeof window === 'undefined' || !currentStep) return;

    const element = document.getElementById(currentStep.elementId);
    if (!element) {
        setHighlightStyle({ display: 'none' });
        setTooltipStyle({
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
        });
        return;
    };

    const rect = element.getBoundingClientRect();
    
    setHighlightStyle({
        position: 'fixed',
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        border: '3px dashed #3b82f6',
        borderRadius: '8px',
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
        pointerEvents: 'none',
        zIndex: 9998,
        transition: 'all 0.3s ease-in-out',
    });
    
    let newTooltipStyle: React.CSSProperties = {
        position: 'fixed',
        zIndex: 9999,
    };

    const tooltipElement = document.getElementById('tutorial-tooltip');
    const tooltipHeight = tooltipElement?.offsetHeight || 150;
    const tooltipWidth = tooltipElement?.offsetWidth || 300;
    const margin = 20;
    
    if (rect.right + margin + tooltipWidth < window.innerWidth) {
      newTooltipStyle.left = `${rect.right + margin}px`;
    } else {
      newTooltipStyle.left = `${rect.left - tooltipWidth - margin}px`;
    }

    if (rect.top + tooltipHeight < window.innerHeight) {
        newTooltipStyle.top = `${rect.top}px`;
    } else {
        newTooltipStyle.top = `${rect.bottom - tooltipHeight}px`;
    }
    
    setTooltipStyle(newTooltipStyle);
    
  }, [step, currentStep]);

  useEffect(() => {
    if (currentStep.type === 'action' && currentStep.waitFor) {
      const handleAction = (event: Event) => {
        const customEvent = event as CustomEvent;
        const advance = () => {
            if (currentStep.requiredCount) {
              if (customEvent.detail?.totalBlocks >= currentStep.requiredCount) {
                handleNext();
              }
            } else {
              handleNext();
            }
        };

        // Defer state update to next tick
        setTimeout(advance, 0);
      };

      const eventName = `tutorial:${currentStep.waitFor}`;
      window.addEventListener(eventName, handleAction);
      
      return () => {
        window.removeEventListener(eventName, handleAction);
      };
    }
  }, [step, currentStep]);


  const handleNext = () => {
    if (step < tutorialSteps.length - 1) {
        setStep(step + 1);
    } else {
        onExit();
    }
  }
  
  const handlePrev = () => {
      if (step > 0) {
          setStep(step - 1);
      }
  }

  if (!currentStep) return null;

  return (
    <>
      <div id="tutorial-highlight" style={highlightStyle} />
      
      <div id="tutorial-tooltip" style={tooltipStyle} className="bg-card text-card-foreground p-5 rounded-lg max-w-sm shadow-2xl border border-border animate-bounce-in">
        <h3 className="font-bold text-lg mb-2 text-primary">{currentStep.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{currentStep.description}</p>
        
        <div className="flex justify-between items-center mt-4 gap-2">
            <span className="text-xs text-muted-foreground">{step + 1} / {tutorialSteps.length}</span>
            <div className="flex gap-2 items-center">
              {step > 0 && <Button variant="ghost" size="sm" onClick={handlePrev}>Anterior</Button>}

              {currentStep.type === 'info' && (
                <Button size="sm" onClick={handleNext}>
                 {step === tutorialSteps.length - 1 ? 'Finalizar' : 'Siguiente'}
                </Button>
              )}

              {currentStep.type === 'action' && (
                  <div className="text-xs font-semibold bg-primary/20 text-primary px-3 py-1.5 rounded-md">
                      ⏳ Esperando acción...
                  </div>
              )}
            </div>
             <Button variant="link" size="sm" onClick={onExit} className="text-muted-foreground">Saltar</Button>
        </div>
      </div>
    </>
  );
}
