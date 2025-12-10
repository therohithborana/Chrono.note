import React from 'react';
import { format, formatDistanceStrict } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Note } from '@/lib/types';

interface NoteItemProps {
  note: Note;
  previousNoteTimestamp: number | null;
  isLast: boolean;
}

export function NoteItem({ note, previousNoteTimestamp, isLast }: NoteItemProps) {
  const duration = previousNoteTimestamp
    ? formatDistanceStrict(note.timestamp, previousNoteTimestamp)
    : null;

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center -mt-1">
        <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background">
          <div className="h-3 w-3 rounded-full bg-primary/80 ring-4 ring-background" />
        </div>
        {!isLast && <div className="w-px flex-1 bg-border -mt-2" />}
      </div>
      <div className="pb-8 pt-0.5 flex-1">
        <div className="flex items-baseline gap-3 text-sm">
          <span className="font-semibold text-foreground tracking-tight">{format(new Date(note.timestamp), 'HH:mm:ss')}</span>
          {duration && (
            <span className="text-accent-foreground bg-accent/40 px-2 py-0.5 rounded-full text-xs font-medium">
              +{duration}
            </span>
          )}
        </div>
        <p className="mt-2 text-foreground/90 whitespace-pre-wrap leading-relaxed">{note.content}</p>
      </div>
    </div>
  );
}
