import * as Dialog from "@radix-ui/react-dialog";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X } from "lucide-react";

interface NoteCardProps {
  note: {
    id: string;
    date: Date;
    content: string;
  };
  onNoteDeleted: (id: string) => void;
}

export function NoteCard({ note, onNoteDeleted }: NoteCardProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded-xl text-left bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm flex flex-col p-4 md:p-5 gap-3 overflow-hidden relative hover:ring-2 hover:ring-blue-500/50 focus-visible:ring-2 focus-visible:ring-blue-400 outline-none transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:scale-[1.02] border border-slate-700/60 hover:border-slate-600/80">
        <span className="text-xs md:text-sm font-medium text-slate-300">
          {formatDistanceToNow(note.date, {
            locale: ptBR,
            addSuffix: true,
          })}
        </span>

        <p className="text-xs md:text-sm leading-6 text-slate-300 line-clamp-6">{note.content}</p>

        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none" />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay
          className="inset-0 fixed bg-black/50 z-40"
          onPointerDown={(e) => {
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
                calculatorButton.click();
              }
            }
          }}
        />
        <Dialog.Content className="fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-800/95 backdrop-blur-xl md:rounded-2xl flex flex-col outline-none border border-slate-700/60 shadow-2xl shadow-black/50 z-50">
          <Dialog.Close className="absolute right-2 top-2 bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-sm p-2 rounded-lg text-slate-400 hover:text-white transition-all duration-200 hover:scale-110 shadow-lg border border-slate-700/50 hover:border-slate-600/50">
            <X className="size-4" />
          </Dialog.Close>

          <div className="flex flex-1 flex-col gap-3 p-5">
            <span className="text-sm font-medium text-slate-300">
              {formatDistanceToNow(note.date, {
                locale: ptBR,
                addSuffix: true,
              })}
            </span>

            <p className="text-sm leading-6 text-slate-400">{note.content}</p>
          </div>

          <button
            type="button"
            onClick={() => onNoteDeleted(note.id)}
            className="w-full bg-slate-800 py-4 text-center text-sm text-slate-300 outline-none font-medium group"
          >
            Deseja{" "}
            <span className="text-red-400 group-hover:underline">
              apagar essa nota
            </span>
            ?
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
