import * as Dialog from "@radix-ui/react-dialog";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X, Pencil, Save } from "lucide-react";
import { useState, ChangeEvent } from "react";
import { toast } from "sonner";

interface NoteCardProps {
  note: {
    id: string;
    date: Date;
    content: string;
  };
  onNoteDeleted: (id: string) => void;
  onNoteEdited: (id: string, newContent: string) => void;
}

export function NoteCard({ note, onNoteDeleted, onNoteEdited }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(note.content);

  /**
   * Função para iniciar a edição da nota
   */
  function handleStartEdit() {
    setIsEditing(true);
    setEditedContent(note.content);
  }

  /**
   * Função para cancelar a edição
   */
  function handleCancelEdit() {
    setIsEditing(false);
    setEditedContent(note.content);
  }

  /**
   * Função para salvar a edição
   */
  function handleSaveEdit() {
    if (editedContent.trim() === "") {
      toast.error("A nota não pode estar vazia!");
      return;
    }

    if (editedContent.trim() !== note.content) {
      onNoteEdited(note.id, editedContent.trim());
      toast.success("Nota editada com sucesso!");
    }
    setIsEditing(false);
  }

  /**
   * Função para lidar com mudanças no conteúdo editado
   */
  function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setEditedContent(event.target.value);
  }
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
          <Dialog.Close className="absolute right-2 top-2 bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-sm p-2.5 md:p-3 text-slate-400 hover:text-slate-100 rounded-lg shadow-lg border border-slate-700/50 hover:border-slate-600/80 transition-all duration-200 hover:scale-110 z-10">
            <X className="size-5 md:size-6" />
          </Dialog.Close>

          <div className="flex flex-1 flex-col gap-3 p-5 pt-12 md:pt-5">
            <span className="text-xs md:text-sm font-medium text-slate-300">
              {formatDistanceToNow(note.date, {
                locale: ptBR,
                addSuffix: true,
              })}
            </span>

            {isEditing ? (
              <textarea
                autoFocus
                value={editedContent}
                onChange={handleContentChange}
                className="text-sm leading-6 text-slate-300 bg-slate-800/50 rounded-lg p-3 resize-none flex-1 outline-none border border-slate-700/50 focus:border-blue-500/50 transition-colors"
                placeholder="Digite o conteúdo da nota..."
              />
            ) : (
              <p className="text-sm leading-6 text-slate-400">{note.content}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 p-5 pt-0">
            {isEditing ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 bg-slate-800 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:bg-slate-700/50 transition-colors rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 py-4 text-center text-sm text-white outline-none font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 rounded-lg flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Salvar
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="w-full bg-gradient-to-r from-blue-500/20 to-purple-600/20 hover:from-blue-500/30 hover:to-purple-600/30 py-3 md:py-3.5 text-center text-sm text-blue-400 hover:text-blue-300 outline-none font-medium transition-all duration-200 rounded-lg flex items-center justify-center gap-2 border border-blue-500/30 hover:border-blue-500/50"
                >
                  <Pencil className="w-4 h-4" />
                  Editar Nota
                </button>
                <button
                  type="button"
                  onClick={() => onNoteDeleted(note.id)}
                  className="w-full bg-slate-800 py-4 text-center text-sm text-slate-300 outline-none font-medium group hover:bg-slate-700/50 transition-colors rounded-lg"
                >
                  Deseja{" "}
                  <span className="text-red-400 group-hover:underline">
                    apagar essa nota
                  </span>
                  ?
                </button>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
