'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import type { Note } from '@/lib/types';
import { NoteItem } from '@/components/NoteItem';
import { Share2, History } from 'lucide-react';
import { Button } from './ui/button';

interface ChronoNoteProps {
  initialNotesData?: string;
}

export function ChronoNote({ initialNotesData }: ChronoNoteProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);

    // Set initial time on client to avoid hydration mismatch
    setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));

    return () => clearInterval(timer);
  }, []);

  const loadNotes = useCallback(() => {
    try {
      const savedNotes = localStorage.getItem('chrono-notes');
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error('Failed to load notes from local storage', error);
      toast({
        title: "Error loading notes",
        description: "Could not load notes from your browser's storage.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    if (initialNotesData) {
      try {
        const decodedData = decodeURIComponent(atob(initialNotesData));
        const parsedNotes: Note[] = JSON.parse(decodedData);
        if (Array.isArray(parsedNotes) && parsedNotes.every(n => 'id' in n && 'content' in n && 'timestamp' in n)) {
          setNotes(parsedNotes);
          localStorage.setItem('chrono-notes', JSON.stringify(parsedNotes));
        } else {
          throw new Error("Invalid note data structure");
        }
        window.history.replaceState(null, '', window.location.pathname);
      } catch (e) {
        console.error("Failed to parse notes from URL", e);
        toast({
          title: "Error loading shared notes",
          description: "The share link appears to be corrupted or invalid.",
          variant: "destructive",
        });
      }
    }
  }, [initialNotesData, toast]);
  
  const handleBlur = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setEditingNoteId(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleBlur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleBlur]);

  const updateNotes = (updatedNotes: Note[]) => {
    const sortedNotes = updatedNotes.sort((a, b) => a.timestamp - b.timestamp);
    setNotes(sortedNotes);
    localStorage.setItem('chrono-notes', JSON.stringify(sortedNotes));
  };
  
  const handleAddNewNote = useCallback(() => {
    if (newNoteContent.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        content: newNoteContent.trim(),
        timestamp: Date.now(),
      };
      const updatedNotes = [...notes, newNote];
      updateNotes(updatedNotes);
      setNewNoteContent('');
    }
  }, [newNoteContent, notes]);

  const handleUpdateNote = useCallback((noteId: string, content: string) => {
    setEditingNoteId(null);
    if (content.trim() === '') {
      handleDeleteNote(noteId);
      return;
    }
    // Do not update timestamp on edit
    const updatedNotes = notes.map(note => 
      note.id === noteId ? { ...note, content } : note
    );
    updateNotes(updatedNotes);
  }, [notes]);
  
  const handleDeleteNote = useCallback((noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    updateNotes(updatedNotes);
  }, [notes]);

  const handleShare = useCallback(() => {
    if (notes.length === 0) {
      toast({
        title: "Cannot share empty notes",
        description: "Add some notes before sharing.",
        variant: "destructive",
      });
      return;
    }
    const data = JSON.stringify(notes);
    const encodedData = btoa(encodeURIComponent(data));
    const url = `${window.location.origin}/?notes=${encodedData}`;

    navigator.clipboard.writeText(url).then(() => {
      toast({ title: "Share link copied to clipboard!" });
    });
  }, [notes, toast]);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      <div className='px-4 pt-12'>
        <h2 className="text-base font-medium text-muted-foreground mb-10">Today</h2>

        <div className="flex flex-col">
          {notes.map((note, index) => (
            <NoteItem
              key={note.id}
              note={note}
              isEditing={editingNoteId === note.id}
              onSetEditing={() => setEditingNoteId(note.id)}
              nextNoteTimestamp={index < notes.length - 1 ? notes[index + 1].timestamp : null}
              onUpdate={handleUpdateNote}
              onDelete={handleDeleteNote}
            />
          ))}
        </div>
        
        <div className="flex items-baseline gap-4 mt-2 w-full">
           <span className="text-sm text-muted-foreground font-mono w-24 shrink-0 text-right">
            {currentTime || '00:00:00'}
          </span>
          <div className='flex-grow'>
            <input
              type="text"
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Start writing..."
              className="w-full text-base bg-transparent border-none focus:ring-0 p-0 m-0 placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddNewNote();
                }
              }}
              onBlur={() => newNoteContent.trim() && handleAddNewNote()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}