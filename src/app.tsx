import { ChangeEvent, useState } from "react";
import { NewNoteCard } from "./components/new-note-card";
import { NoteCard } from "./components/note-card";
import { Calculator } from "./components/calculator";
import { ClipboardList } from "lucide-react";

interface Note {
  id: string;
  date: Date;
  content: string;
}

export function App() {
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState<Note[]>(() => {
    const notesOnStorage = localStorage.getItem("notes");

    if (notesOnStorage) {
      return JSON.parse(notesOnStorage);
    }

    return [];
  });

  function onNoteCreated(content: string) {
    const newNote = {
      id: crypto.randomUUID(),
      date: new Date(),
      content,
    };

    const notesArray = [newNote, ...notes];

    setNotes(notesArray);

    localStorage.setItem("notes", JSON.stringify(notesArray));
  }

  function onNoteDeleted(id: string) {
    const notesArray = notes.filter((note) => {
      return note.id !== id;
    });

    setNotes(notesArray);

    localStorage.setItem("notes", JSON.stringify(notesArray));
  }

  function onNoteEdited(id: string, newContent: string) {
    const notesArray = notes.map((note) => {
      if (note.id === id) {
        return {
          ...note,
          content: newContent,
          date: new Date(), // Atualiza a data quando edita
        };
      }
      return note;
    });

    setNotes(notesArray);
    localStorage.setItem("notes", JSON.stringify(notesArray));
  }

  function handleSearch(event: ChangeEvent<HTMLInputElement>) {
    const query = event.target.value;

    setSearch(query);
  }

  const filteredNotes =
    search !== ""
      ? notes.filter((note) =>
          note.content.toLocaleLowerCase().includes(search.toLocaleLowerCase())
        )
      : notes;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Efeito de background decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.1),transparent_50%)] pointer-events-none" />
      
      <div className="mx-auto max-w-6xl pt-6 md:pt-8 space-y-4 md:space-y-6 px-4 md:px-5 pb-24 md:pb-12 relative z-10">
        {/* Cabeçalho com logo */}
        <div className="flex items-center justify-start mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4 group">
            <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 p-2.5 md:p-3 rounded-lg md:rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center transition-all duration-300 group-hover:shadow-blue-500/40 group-hover:scale-105">
              <ClipboardList className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent leading-tight tracking-tight">
                ProdManager
              </h1>
              <p className="text-xs md:text-sm text-slate-400 font-medium mt-0.5">
                Gerenciador de Produção
              </p>
            </div>
          </div>
        </div>

        {/* Barra de busca melhorada */}
        <div className="w-full bg-slate-800/60 backdrop-blur-md rounded-xl p-3 md:p-4 border border-slate-700/60 shadow-xl shadow-black/20 transition-all duration-300 hover:border-slate-600/80 hover:shadow-2xl hover:shadow-black/30">
          <input
            type="text"
            placeholder="Busque em suas notas..."
            value={search}
            onChange={handleSearch}
            className="w-full bg-transparent text-xl md:text-2xl font-semibold tracking-tight outline-none placeholder:text-slate-500 text-slate-200 focus:placeholder:text-slate-600 transition-colors"
          />
        </div>

        {/* Divisor estilizado */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

        {/* Grid de notas responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-[200px] md:auto-rows-[250px]">
          <NewNoteCard onNoteCreated={onNoteCreated} />

          {filteredNotes.map((note) => {
            return (
              <NoteCard 
                onNoteDeleted={onNoteDeleted} 
                onNoteEdited={onNoteEdited}
                key={note.id} 
                note={note} 
              />
            );
          })}
        </div>

        {/* Mensagem quando não há notas */}
        {filteredNotes.length === 0 && search === "" && (
          <div className="text-center py-12 md:py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 mb-4">
              <ClipboardList className="w-8 h-8 md:w-10 md:h-10 text-slate-500" />
            </div>
            <p className="text-slate-400 text-lg md:text-xl font-medium">
              Nenhuma nota encontrada. Crie sua primeira nota!
            </p>
          </div>
        )}

        {/* Mensagem quando a busca não retorna resultados */}
        {filteredNotes.length === 0 && search !== "" && (
          <div className="text-center py-12 md:py-16">
            <p className="text-slate-400 text-lg md:text-xl font-medium">
              Nenhuma nota encontrada para <span className="text-slate-300 font-semibold">"{search}"</span>
            </p>
          </div>
        )}
      </div>

      {/* Componente da Calculadora */}
      <Calculator />
    </div>
  );
}

