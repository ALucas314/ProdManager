import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { toast } from "sonner";

interface NewNoteProps {
  onNoteCreated: (content: string) => void;
}

const SpeechRecognitionAPI =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export function NewNoteCard({ onNoteCreated }: NewNoteProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true);
  const [content, setContent] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [calculatorIsOpen, setCalculatorIsOpen] = useState(false);

  const speechRecognition = new SpeechRecognitionAPI();


  // Effect para detectar quando a calculadora está aberta e ajustar a opacidade do dialog
  useEffect(() => {
    const checkCalculator = () => {
      const calculator = document.querySelector('[aria-label="Fechar calculadora"]')?.closest('[class*="z-[100]"]');
      const calculatorVisible = calculator && window.getComputedStyle(calculator as HTMLElement).display !== 'none';
      const dialogContent = document.querySelector('[data-radix-dialog-content]') as HTMLElement;
      const dialogOverlay = document.querySelector('[data-radix-dialog-overlay]') as HTMLElement;

      if (calculatorVisible) {
        setCalculatorIsOpen(true);
        if (dialogContent && isOpen) {
          // Se a calculadora estiver aberta, reduz a opacidade do dialog mas mantém visível
          dialogContent.style.opacity = '0.7';
          dialogContent.style.pointerEvents = 'none';
        }
        // Desabilita pointer-events no overlay do dialog para permitir cliques na calculadora
        if (dialogOverlay && isOpen) {
          dialogOverlay.style.pointerEvents = 'none';
        }
      } else {
        setCalculatorIsOpen(false);
        if (dialogContent && isOpen) {
          // Se a calculadora estiver fechada, restaura a opacidade normal
          dialogContent.style.opacity = '1';
          dialogContent.style.pointerEvents = 'auto';
        }
        // Restaura pointer-events no overlay do dialog
        if (dialogOverlay && isOpen) {
          dialogOverlay.style.pointerEvents = 'auto';
        }
      }
    };

    // Verifica a cada 50ms se a calculadora está aberta (mais frequente para resposta mais rápida)
    const interval = setInterval(checkCalculator, 50);

    return () => clearInterval(interval);
  }, [isOpen]);

  function handleStartEditor() {
    setShouldShowOnboarding(false);
  }

  function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value);

    if (event.target.value === "") {
      setShouldShowOnboarding(true);
    }
  }

  function handleSaveNote(event: FormEvent) {
    event.preventDefault();

    if (content.trim() === "") return;

    onNoteCreated(content);
    setContent("");
    setShouldShowOnboarding(true);

    toast.success("Nota criada com sucesso!");
  }

  function handleStartRecording() {
    const isSpeechRecognitionAPIAvailable =
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window;

    if (!isSpeechRecognitionAPIAvailable) {
      alert("Infelizmente seu navegador não suporta a API de gravação!");
      return;
    }

    setIsRecording(true);
    setShouldShowOnboarding(false);

    speechRecognition.lang = "pt-BR";
    speechRecognition.continuous = true;
    speechRecognition.interimResults = false; // 🔕 elimina repetições
    speechRecognition.maxAlternatives = 1;

    speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastResult = event.results[event.results.length - 1];
      const transcript = lastResult[0].transcript;

      setContent(transcript); // ✅ substitui, não concatena
    };

    speechRecognition.onerror = (event) => {
      console.error("Speech recognition error:", event);
    };

    speechRecognition.start();
  }

  function handleStopRecording() {
    setIsRecording(false);
    speechRecognition.stop();
  }

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        // Previne que o dialog feche quando a calculadora estiver sendo aberta ou já está aberta
        if (!open) {
          // Verifica se a calculadora está sendo aberta (atributo data)
          const calculatorOpening = document.body.getAttribute('data-calculator-opening') === 'true';

          // Verifica se a calculadora já está aberta
          if (calculatorIsOpen || calculatorOpening) {
            // Se a calculadora estiver aberta ou sendo aberta, NUNCA fecha o dialog
            // Usa requestAnimationFrame para garantir que acontece após o Radix processar
            requestAnimationFrame(() => {
              setIsOpen(true);
            });
            return;
          }

          // Verifica uma última vez se a calculadora está aberta no DOM
          const calculator = document.querySelector('[aria-label="Fechar calculadora"]')?.closest('[class*="z-[100]"]');
          if (calculator && window.getComputedStyle(calculator as HTMLElement).display !== 'none') {
            setCalculatorIsOpen(true);
            requestAnimationFrame(() => {
              setIsOpen(true);
            });
            return;
          }
        }
        setIsOpen(open);
      }}
      modal={true}
    >
      <Dialog.Trigger
        className="rounded-xl flex flex-col gap-3 text-left bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm p-5 md:p-6 hover:ring-2 hover:ring-blue-500/50 focus-visible:ring-2 focus-visible:ring-blue-400 outline-none transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:scale-[1.02] border border-slate-700/60 hover:border-slate-600/80"
        onClick={() => setIsOpen(true)}
      >
        <span className="text-sm md:text-base font-semibold text-slate-100">
          Adicionar nota
        </span>

        <p className="text-xs md:text-sm leading-6 text-slate-300">
          Grave uma nota em áudio que será convertida para texto automaticamente.
        </p>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay
          className="inset-0 fixed bg-black/50 z-40"
          style={{
            // Desabilita pointer-events quando a calculadora está aberta para permitir cliques na calculadora
            pointerEvents: calculatorIsOpen ? 'none' : 'auto'
          }}
          onPointerDown={(e) => {
            // Se a calculadora estiver aberta, não processa eventos do overlay
            if (calculatorIsOpen) {
              e.stopPropagation();
              return;
            }

            // Permite que cliques no botão da calculadora funcionem
            const calculatorButton = document.querySelector('[aria-label="Abrir calculadora"]') as HTMLElement;
            if (calculatorButton) {
              const rect = calculatorButton.getBoundingClientRect();
              const clickX = e.clientX;
              const clickY = e.clientY;
              // Verifica se o clique está na área do botão
              if (
                clickX >= rect.left &&
                clickX <= rect.right &&
                clickY >= rect.top &&
                clickY <= rect.bottom
              ) {
                e.stopPropagation();
                e.preventDefault();
                // Abre a calculadora sem fechar o dialog
                calculatorButton.click();
                // Força o dialog a permanecer aberto
                setCalculatorIsOpen(true);
                setTimeout(() => setIsOpen(true), 0);
                return;
              }
            }

            // Verifica uma última vez se a calculadora está aberta
            const calculator = document.querySelector('[aria-label="Fechar calculadora"]')?.closest('[class*="z-[100]"]');
            if (calculator && window.getComputedStyle(calculator as HTMLElement).display !== 'none') {
              e.preventDefault();
              e.stopPropagation();
              setCalculatorIsOpen(true);
              setTimeout(() => setIsOpen(true), 0);
              return;
            }
          }}
          onClick={(e) => {
            // Se a calculadora estiver aberta, não processa eventos do overlay
            if (calculatorIsOpen) {
              e.stopPropagation();
              return;
            }

            // Verifica uma última vez se a calculadora está aberta
            const calculator = document.querySelector('[aria-label="Fechar calculadora"]')?.closest('[class*="z-[100]"]');
            if (calculator && window.getComputedStyle(calculator as HTMLElement).display !== 'none') {
              e.preventDefault();
              e.stopPropagation();
              setCalculatorIsOpen(true);
              setTimeout(() => setIsOpen(true), 0);
              return;
            }
          }}
        />
        <Dialog.Content
          className="fixed inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-800/95 backdrop-blur-xl md:rounded-2xl flex flex-col outline-none border border-slate-700/60 shadow-2xl shadow-black/50 z-50 transition-opacity duration-300"
          style={{ pointerEvents: 'auto' }}
          onPointerDownOutside={(e) => {
            // Verifica se o clique foi no botão da calculadora
            const target = e.target as HTMLElement;
            const calculatorButton = document.querySelector('[aria-label="Abrir calculadora"]') as HTMLElement;

            // Se o clique foi no botão da calculadora ou em seus filhos, previne o fechamento
            if (calculatorButton && (target === calculatorButton || calculatorButton.contains(target))) {
              e.preventDefault();
              setCalculatorIsOpen(true);
              setTimeout(() => setIsOpen(true), 0);
              return;
            }

            // Previne que o dialog feche quando clicar fora se a calculadora estiver aberta
            if (calculatorIsOpen) {
              e.preventDefault();
              // Força o dialog a permanecer aberto
              setTimeout(() => setIsOpen(true), 0);
              return;
            }

            // Verifica uma última vez se a calculadora está aberta
            const calculator = document.querySelector('[aria-label="Fechar calculadora"]')?.closest('[class*="z-[100]"]');
            if (calculator && window.getComputedStyle(calculator as HTMLElement).display !== 'none') {
              e.preventDefault();
              setCalculatorIsOpen(true);
              setTimeout(() => setIsOpen(true), 0);
            }
          }}
          onEscapeKeyDown={(e) => {
            // Previne que o dialog feche com ESC se a calculadora estiver aberta
            if (calculatorIsOpen) {
              e.preventDefault();
              // Força o dialog a permanecer aberto
              setTimeout(() => setIsOpen(true), 0);
              return;
            }
            // Verifica uma última vez
            const calculator = document.querySelector('[aria-label="Fechar calculadora"]')?.closest('[class*="z-[100]"]');
            if (calculator && window.getComputedStyle(calculator as HTMLElement).display !== 'none') {
              e.preventDefault();
              setTimeout(() => setIsOpen(true), 0);
            }
          }}
        >
          <Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
            <X className="size-5" />
          </Dialog.Close>

          <form className="flex-1 flex flex-col">
            <div className="flex flex-1 flex-col gap-3 p-5">
              <span className="text-sm font-medium text-slate-300">
                Adicionar nota
              </span>

              {shouldShowOnboarding ? (
                <p className="text-sm leading-6 text-slate-400">
                  Comece{" "}
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                  >
                    gravando uma nota
                  </button>{" "}
                  em áudio ou se preferir{" "}
                  <button
                    type="button"
                    onClick={handleStartEditor}
                    className="font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                  >
                    utilize apenas texto
                  </button>
                  .
                </p>
              ) : (
                <textarea
                  autoFocus
                  className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
                  onChange={handleContentChanged}
                  value={content}
                />
              )}
            </div>

            {isRecording ? (
              <button
                type="button"
                onClick={handleStopRecording}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-sm text-slate-300 font-medium hover:text-slate-100"
              >
                <div className="size-3 rounded-full bg-red-500 animate-pulse" />
                Gravando! (clique p/ interromper)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveNote}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 py-4 text-sm text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 rounded-lg"
              >
                Salvar nota
              </button>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

