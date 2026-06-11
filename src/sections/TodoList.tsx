import { useState } from 'react';
import { Check, Trash2, GripVertical } from 'lucide-react';
import type { TodoItem } from '../types/todo';

interface TodoListProps {
  todos: TodoItem[];
  activeTodoId: number | null;
  onSelectTodo: (todo: TodoItem) => void;
  onAddTodo: (title: string, durationMs: number) => void;
  onRemoveTodo: (id: number) => void;
  onToggleComplete: (todo: TodoItem) => void;
}

function pad2(n: number) { return String(n).padStart(2, '0'); }
function fmtDur(ms: number): string {
  return `${pad2(Math.floor(ms / 60000))}:${pad2(Math.floor((ms % 60000) / 1000))}`;
}

export default function TodoList({
  todos, activeTodoId, onSelectTodo, onAddTodo,
  onRemoveTodo, onToggleComplete,
}: TodoListProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newMins, setNewMins] = useState('25');

  const pending = todos.filter(t => t.completedAt === null);
  const completed = todos.filter(t => t.completedAt !== null);

  const handleAdd = () => {
    const mins = parseInt(newMins) || 25;
    if (newTitle.trim()) {
      onAddTodo(newTitle.trim(), mins * 60 * 1000);
      setNewTitle(''); setNewMins('25');
    }
  };

  const renderItem = (todo: TodoItem) => {
    const active = activeTodoId === todo.id;
    const done = !!todo.completedAt;
    return (
      <div
        key={todo.id}
        onClick={() => !done && onSelectTodo(todo)}
        className={`group flex items-center gap-2 px-4 py-2.5 border-b border-[var(--panel-mid)] cursor-pointer transition-colors
          ${active ? 'bg-[var(--panel-mid)]' : 'hover:bg-[var(--panel-mid)]'}
          ${done ? 'opacity-40' : ''}`}
      >
        <GripVertical size={12} className="text-[var(--accent)] opacity-40 shrink-0" />

        <button
          onClick={(e) => { e.stopPropagation(); onToggleComplete(todo); }}
          className={`w-4 h-4 border shrink-0 flex items-center justify-center transition-colors
            ${done ? 'border-[var(--accent-soft)] bg-[var(--accent-soft)]' : 'border-[var(--accent)] hover:border-[var(--accent-soft)]'}`}
        >
          {done && <Check size={10} className="text-[var(--panel-dark)]" strokeWidth={3} />}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-[11px] font-semibold truncate ${done ? 'line-through text-[var(--text-muted)]' : 'text-white'}`}>
            {todo.title}
          </p>
          <p className="text-[9px] text-[var(--accent)] font-medium tabular-nums">{fmtDur(todo.durationMs)}</p>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onRemoveTodo(todo.id); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[var(--panel-mid)]"
        >
          <Trash2 size={12} className="text-[var(--panel-light)]" />
        </button>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[var(--panel-dark)] text-white overflow-hidden">

      {/* ---- HEADER ---- */}
      <div className="px-4 py-3 flex-shrink-0">
        <p className="text-[10px] font-bold text-[var(--panel-light)] tracking-[0.2em]">TODO LIST</p>
        <p className="text-[9px] text-[var(--accent)] mt-0.5">
          {pending.length} pending / {completed.length} done
        </p>
      </div>

      <div className="h-px bg-[var(--panel-mid)] flex-shrink-0" />

      {/* ---- SCROLLABLE LIST ---- */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {pending.map(renderItem)}

        {completed.length > 0 && (
          <>
            <div className="px-4 py-1.5 bg-[var(--panel-dark)]">
              <p className="text-[8px] font-bold text-[var(--accent)] tracking-[0.2em]">
                COMPLETED ({completed.length})
              </p>
            </div>
            {completed.map(renderItem)}
          </>
        )}

        {todos.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-[10px] text-[var(--accent)]">No tasks yet</p>
            <p className="text-[9px] text-[var(--panel-mid)] mt-1">Add one below</p>
          </div>
        )}
      </div>

      {/* ---- BOTTOM: ADD NEW TODO ---- */}
      <div className="flex-shrink-0 border-t border-[var(--panel-mid)]">
        <div className="px-4 pt-3 pb-2">
          <p className="text-[9px] font-bold text-[var(--panel-light)] tracking-[0.2em] mb-2">ADD NEW TASK</p>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
            placeholder="Task name..."
            className="w-full bg-transparent border-b border-[var(--accent)] text-[11px] font-semibold text-white outline-none placeholder:text-[var(--panel-mid)] pb-1.5 mb-2"
          />
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[9px] text-[var(--accent)] font-medium">DURATION</span>
            <input
              type="text"
              value={newMins}
              onChange={(e) => setNewMins(e.target.value.replace(/\D/g, '').slice(0, 3))}
              className="w-14 bg-transparent border-b border-[var(--accent)] text-[11px] font-bold text-white text-center outline-none tabular-nums pb-1"
            />
            <span className="text-[9px] text-[var(--accent)]">min</span>
          </div>
          <button
            onClick={handleAdd}
            className="w-full h-9 border border-[var(--accent)] text-[10px] font-bold tracking-[0.15em] text-[var(--accent-soft)] hover:bg-[var(--panel-mid)] hover:text-white transition-colors"
          >
            ADD TASK
          </button>
        </div>
      </div>
    </div>
  );
}
