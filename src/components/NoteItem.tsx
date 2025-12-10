import React, { useState, useRef, useEffect } from 'react';
import { format, formatDistanceStrict } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Note } from '@/lib/types';
import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';

interface NoteItemProps {
  note: Note;
  previousNoteTimestamp: number | null;
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

export function NoteItem({ note, previousNoteTimestamp, onUpdate, onDelete, isEditing, onSetEditing }: NoteItemProps) {
  const [content, setContent] = useState(note.content);
  const inputRef = useRef<HTMLInputElement>(null);

  const duration = previousNoteTimestamp
    ? formatDuration(formatDistanceStrict(note.timestamp, previousNoteTimestamp))
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
    if (content !== note.content) {
      onUpdate(note.id, content);
    } else {
       onUpdate(note.id, note.content); // To signal exit from editing
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
    if (e.key === 'Escape') {
      setContent(note.content);
      // Let the global handler in ChronoNote handle the blur
    }
  };

  return (
    <div className="group flex flex-row items-start gap-4">
      <div className="w-20 shrink-0 font-mono text-sm">
        <span className="text-muted-foreground pt-2">
          {format(new Date(note.timestamp), 'HH:mm:ss')}
        </span>
        {duration && (
          <div className="text-xs text-muted-foreground/80 mt-1">
            +{duration}
          </div>
        )}
      </div>
      <div className="flex-grow pt-0.5" onClick={() => onSetEditing(note.id)}>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full text-base bg-transparent border-none focus:ring-0 p-0 m-0 h-8"
          />
        ) : (
          <p className="mt-0 text-foreground/90 whitespace-pre-wrap leading-relaxed h-8 pt-1.5">{note.content}</p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onDelete(note.id)}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete note</span>
      </Button>
    </div>
  );
}
