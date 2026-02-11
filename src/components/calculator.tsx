import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Calculator as CalculatorIcon, X } from "lucide-react";

/**
 * Componente de Calculadora
 * Fornece uma interface bonita e intuitiva para realizar cálculos matemáticos
 */
export function Calculator() {
  // Estado para controlar se a calculadora está aberta ou fechada
  const [isOpen, setIsOpen] = useState(false);
  
  // Ref para o botão da calculadora
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Effect para garantir que o botão seja clicável mesmo com overlays ativos
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    // Função para lidar com cliques no botão
    const handleClick = (e: MouseEvent | TouchEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setIsOpen(true);
    };

    // Adiciona event listeners com capture phase para interceptar antes dos overlays
    button.addEventListener('click', handleClick, true);
    button.addEventListener('touchstart', handleClick, true);
    button.addEventListener('mousedown', handleClick, true);

    return () => {
      button.removeEventListener('click', handleClick, true);
      button.removeEventListener('touchstart', handleClick, true);
      button.removeEventListener('mousedown', handleClick, true);
    };
  }, []);
  
  // Estado para armazenar o valor atual exibido na calculadora
  const [display, setDisplay] = useState("0");
  
  // Estado para armazenar o valor anterior (para operações)
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  
  // Estado para armazenar a operação atual (+, -, *, /)
  const [operation, setOperation] = useState<string | null>(null);
  
  // Estado para controlar se um novo número deve ser iniciado
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);

  /**
   * Função para lidar com a entrada de números
   * @param num - O número digitado (0-9)
   */
  function handleNumber(num: string) {
    if (shouldResetDisplay) {
      setDisplay(num);
      setShouldResetDisplay(false);
    } else {
      // Evita múltiplos zeros à esquerda
      if (display === "0") {
        setDisplay(num);
      } else {
        setDisplay(display + num);
      }
    }
  }

  /**
   * Função para lidar com operações matemáticas (+, -, *, /)
   * @param op - A operação a ser realizada
   */
  function handleOperation(op: string) {
    const currentValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(currentValue);
    } else if (operation) {
      // Calcula o resultado da operação anterior
      const result = calculate(previousValue, currentValue, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }

    setOperation(op);
    setShouldResetDisplay(true);
  }

  /**
   * Função para realizar o cálculo baseado na operação
   * @param prev - Valor anterior
   * @param current - Valor atual
   * @param op - Operação a ser realizada
   * @returns Resultado do cálculo
   */
  function calculate(prev: number, current: number, op: string): number {
    switch (op) {
      case "+":
        return prev + current;
      case "-":
        return prev - current;
      case "*":
        return prev * current;
      case "/":
        // Evita divisão por zero
        if (current === 0) {
          alert("Erro: Divisão por zero!");
          return prev;
        }
        return prev / current;
      default:
        return current;
    }
  }

  /**
   * Função para calcular o resultado final quando o botão "=" é pressionado
   */
  function handleEquals() {
    if (previousValue !== null && operation) {
      const currentValue = parseFloat(display);
      const result = calculate(previousValue, currentValue, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setShouldResetDisplay(true);
    }
  }

  /**
   * Função para limpar tudo (reset completo)
   */
  function handleClear() {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setShouldResetDisplay(false);
  }

  /**
   * Função para limpar apenas o valor atual (CE - Clear Entry)
   */
  function handleClearEntry() {
    setDisplay("0");
    setShouldResetDisplay(false);
  }


  /**
   * Função para calcular a porcentagem
   */
  function handlePercentage() {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
    setShouldResetDisplay(true);
  }

  /**
   * Função para adicionar ponto decimal
   */
  function handleDecimal() {
    if (shouldResetDisplay) {
      setDisplay("0.");
      setShouldResetDisplay(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  }

  /**
   * Função para apagar o último dígito (backspace)
   */
  function handleBackspace() {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  }

  // Botões da calculadora organizados em um array para facilitar a renderização
  const buttons = [
    { label: "C", onClick: handleClear, className: "bg-red-500 hover:bg-red-600 text-white" },
    { label: "CE", onClick: handleClearEntry, className: "bg-orange-500 hover:bg-orange-600 text-white" },
    { label: "%", onClick: handlePercentage, className: "bg-slate-600 hover:bg-slate-700 text-white" },
    { label: "÷", onClick: () => handleOperation("/"), className: "bg-blue-500 hover:bg-blue-600 text-white" },
    { label: "7", onClick: () => handleNumber("7"), className: "bg-slate-800 hover:bg-slate-700 text-white" },
    { label: "8", onClick: () => handleNumber("8"), className: "bg-slate-800 hover:bg-slate-700 text-white" },
    { label: "9", onClick: () => handleNumber("9"), className: "bg-slate-800 hover:bg-slate-700 text-white" },
    { label: "×", onClick: () => handleOperation("*"), className: "bg-blue-500 hover:bg-blue-600 text-white" },
    { label: "4", onClick: () => handleNumber("4"), className: "bg-slate-800 hover:bg-slate-700 text-white" },
    { label: "5", onClick: () => handleNumber("5"), className: "bg-slate-800 hover:bg-slate-700 text-white" },
    { label: "6", onClick: () => handleNumber("6"), className: "bg-slate-800 hover:bg-slate-700 text-white" },
    { label: "-", onClick: () => handleOperation("-"), className: "bg-blue-500 hover:bg-blue-600 text-white" },
    { label: "1", onClick: () => handleNumber("1"), className: "bg-slate-800 hover:bg-slate-700 text-white" },
    { label: "2", onClick: () => handleNumber("2"), className: "bg-slate-800 hover:bg-slate-700 text-white" },
    { label: "3", onClick: () => handleNumber("3"), className: "bg-slate-800 hover:bg-slate-700 text-white" },
    { label: "+", onClick: () => handleOperation("+"), className: "bg-blue-500 hover:bg-blue-600 text-white" },
    { label: "0", onClick: () => handleNumber("0"), className: "bg-slate-600 hover:bg-slate-700 text-white" },
    { label: ",", onClick: handleDecimal, className: "bg-slate-800 hover:bg-slate-700 text-white" },
    { label: "⌫", onClick: handleBackspace, className: "bg-slate-600 hover:bg-slate-700 text-white" },
    { label: "=", onClick: handleEquals, className: "bg-green-500 hover:bg-green-600 text-white col-span-1" },
  ];

  /**
   * Função para lidar com o clique no botão da calculadora
   * Previne a propagação do evento para garantir que funcione mesmo com overlays ativos
   */
  function handleCalculatorButtonClick(e: React.MouseEvent | React.TouchEvent) {
    e.stopPropagation();
    e.preventDefault();
    
    // Adiciona um atributo data para indicar que a calculadora está sendo aberta
    // Isso ajuda outros componentes a detectar isso ANTES do Radix processar
    document.body.setAttribute('data-calculator-opening', 'true');
    
    // Marca o botão com um atributo para identificação
    const button = e.currentTarget as HTMLElement;
    button.setAttribute('data-calculator-button-clicked', 'true');
    
    setIsOpen(true);
    
    // Remove os atributos após um delay maior para garantir que o Radix processe
    setTimeout(() => {
      document.body.removeAttribute('data-calculator-opening');
      button.removeAttribute('data-calculator-button-clicked');
    }, 500);
  }

  // Renderiza o botão usando Portal para garantir que fique acima de todos os overlays
  // O botão só aparece quando a calculadora está fechada
  const calculatorButton = !isOpen ? (
    <button
      ref={buttonRef}
      onClick={handleCalculatorButtonClick}
      className="fixed bottom-40 md:bottom-44 right-6 z-[9999] bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center w-16 h-16 md:w-20 md:h-20"
      aria-label="Abrir calculadora"
      style={{ 
        pointerEvents: 'auto',
        // Garante que o botão esteja acima de tudo
        position: 'fixed',
        // Z-index muito alto para garantir que fique acima de todos os overlays
        zIndex: 9999
      }}
    >
      <CalculatorIcon className="w-6 h-6 md:w-8 md:h-8" />
    </button>
  ) : null;

  return (
    <>
      {/* Botão flutuante para abrir a calculadora - renderizado via Portal para ficar acima dos dialogs */}
      {/* O botão só aparece quando a calculadora está fechada */}
      {typeof document !== 'undefined' && calculatorButton && createPortal(calculatorButton, document.body)}

      {/* Overlay escuro quando a calculadora está aberta - z-index alto para ficar acima dos dialogs */}
      {/* Não fecha ao clicar no overlay para permitir que o dialog continue aberto */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-[90] backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            // Não fecha ao clicar no overlay para permitir que o dialog continue aberto
            // A calculadora só fecha ao clicar no botão X
            e.stopPropagation();
          }}
        />
      )}

      {/* Calculadora - z-index alto para ficar acima dos dialogs */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8" style={{ pointerEvents: 'auto' }}>
          <div
            className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-700 overflow-hidden animate-calculator-enter"
            onClick={(e) => e.stopPropagation()}
            style={{ pointerEvents: 'auto' }}
          >
            {/* Cabeçalho da calculadora */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <CalculatorIcon className="w-6 h-6" />
                Calculadora
              </h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsOpen(false);
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                aria-label="Fechar calculadora"
                style={{ pointerEvents: 'auto', zIndex: 10001 }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Display da calculadora */}
            <div className="p-4 md:p-6 bg-slate-900">
              <div className="bg-slate-800 rounded-lg p-4 md:p-6 min-h-[80px] md:min-h-[100px] flex flex-col justify-end overflow-hidden">
                {/* Linha superior: mostra valor anterior e operação */}
                {previousValue !== null && operation && (
                  <div className="text-right mb-2">
                    <span className="text-sm md:text-lg font-mono text-slate-400">
                      {(() => {
                        const num = previousValue;
                        if (Math.abs(num) >= 1e10 || (Math.abs(num) < 1e-4 && num !== 0)) {
                          return num.toExponential(3);
                        }
                        const formatted = num.toString();
                        return formatted.length > 12 ? num.toPrecision(8) : formatted;
                      })()}
                      {" "}
                      {operation === "*" ? "×" : operation === "/" ? "÷" : operation}
                    </span>
                  </div>
                )}
                {/* Linha inferior: mostra valor atual */}
                <div className="text-right">
                  <span className="text-2xl md:text-4xl font-mono font-bold text-white break-all">
                    {(() => {
                      const num = parseFloat(display);
                      if (isNaN(num)) return display;
                      // Formata números muito grandes ou muito pequenos
                      if (Math.abs(num) >= 1e10 || (Math.abs(num) < 1e-4 && num !== 0)) {
                        return num.toExponential(6);
                      }
                      // Limita casas decimais para números normais
                      const formatted = num.toString();
                      return formatted.length > 15 ? num.toPrecision(12) : formatted;
                    })()}
                  </span>
                </div>
              </div>
            </div>

            {/* Teclado da calculadora */}
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-4 gap-3 md:gap-4">
                {buttons.map((button, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      button.onClick();
                    }}
                    onTouchStart={(e) => {
                      // Previne que o teclado virtual apareça no mobile
                      e.preventDefault();
                      button.onClick();
                    }}
                    onFocus={(e) => {
                      // Remove o foco imediatamente para prevenir teclado
                      e.currentTarget.blur();
                    }}
                    className={`${button.className} rounded-lg p-3 md:p-4 text-lg md:text-xl font-semibold transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg touch-manipulation`}
                    style={{ 
                      WebkitTapHighlightColor: 'transparent',
                      touchAction: 'manipulation'
                    }}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
