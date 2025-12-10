import React, { useState, useRef, useEffect } from 'react';
import { format, formatDistanceStrict } from 'date-fns';
import type { Note } from '@/lib/types';

interface NoteItemProps {
  note: Note;
  nextNoteTimestamp: number | null;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  isEditing: boolean;
  onSetEditing: (id: string) => void;
}

const formatDuration = (duration: string) => {
  return duration
    .replace(' seconds', 's')
    .replace(' second', 's')
    .replace(' minutes', 'min')
    .replace(' minute', 'min')
    .replace(' hours', 'h')
    .replace(' hour', 'h');
};

export function NoteItem({ note, nextNoteTimestamp, onUpdate, onDelete, isEditing, onSetEditing }: NoteItemProps) {
  const [content, setContent] = useState(note.content);
  const inputRef = useRef<HTMLInputElement>(null);

  const duration = nextNoteTimestamp
    ? formatDuration(formatDistanceStrict(nextNoteTimestamp, note.timestamp))
    : null;

  useEffect(() => {
    setContent(note.content);
  }, [note.content]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    if (content.trim() === '') {
      onDelete(note.id);
    } else {
      onUpdate(note.id, content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setContent(note.content);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="group flex flex-col">
      <div className="flex flex-row items-baseline gap-4">
        <div className="w-24 shrink-0 font-mono text-sm text-right">
          <span className="text-muted-foreground">
            {format(new Date(note.timestamp), 'HH:mm:ss')}
          </span>
        </div>
        <div className="flex-grow" onClick={() => onSetEditing(note.id)}>
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full text-base bg-transparent border-none focus:ring-0 p-0 m-0"
            />
          ) : (
            <p className="text-foreground/90 whitespace-pre-wrap">{content}</p>
          )}
        </div>
      </div>
      {duration && (
        <div className="flex flex-row items-start gap-4 h-6">
          <div className="w-24 shrink-0 font-mono text-xs text-right text-muted-foreground/80 mt-1">
            +{duration}
          </div>
        </div>
      )}
    </div>
  );
}
