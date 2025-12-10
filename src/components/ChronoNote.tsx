'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FileDown, Share2, Eye, EyeOff, ClipboardCopy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import type { Note } from '@/lib/types';
import { NoteItem } from '@/components/NoteItem';

interface ChronoNoteProps {
  initialNotesData?: string;
}

export function ChronoNote({ initialNotesData }: ChronoNoteProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isBlurred, setIsBlurred] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const notesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('chrono-notes');
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error('Failed to load notes from local storage', error);
    }
  }, []);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "'" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsBlurred(prev => !prev);
      }
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleAddNewNote();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [newNoteContent]);

  useEffect(() => {
    notesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [notes]);
  
  const handleAddNewNote = useCallback(() => {
    if (newNoteContent.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        content: newNoteContent.trim(),
        timestamp: Date.now(),
      };
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      localStorage.setItem('chrono-notes', JSON.stringify(updatedNotes));
      setNewNoteContent('');
    }
  }, [newNoteContent, notes]);

  const handleExport = useCallback(() => {
    const textContent = notes
      .map(note => `[${new Date(note.timestamp).toLocaleString()}]\n${note.content}`)
      .join('\n\n---\n\n');
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chrononotes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [notes, toast]);

  return (
    <Card className="max-w-3xl mx-auto shadow-2xl shadow-primary/10">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="font-headline text-3xl tracking-tight">ChronoNote</CardTitle>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setIsBlurred(p => !p)}>
            {isBlurred ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            <span className="sr-only">{isBlurred ? 'Unhide notes' : 'Hide notes'}</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleExport} disabled={notes.length === 0}>
            <FileDown className="h-5 w-5" />
            <span className="sr-only">Export as .txt</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleShare}>
            {copied ? <ClipboardCopy className="h-5 w-5 text-accent-foreground" /> : <Share2 className="h-5 w-5" />}
            <span className="sr-only">Share Notes</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Textarea
            ref={textareaRef}
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="What's on your mind? (Ctrl+Enter to save)"
            className="min-h-[100px] text-base focus-visible:ring-primary"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleAddNewNote();
              }
            }}
          />
          <Button onClick={handleAddNewNote} className="w-full sm:w-auto sm:self-end">Add Note</Button>
        </div>
        <Separator className="my-6" />
        <div className="relative">
          {notes.length > 0 ? (
            <div className={cn('space-y-0 transition-all duration-300', { 'blur-md select-none pointer-events-none': isBlurred })}>
              {notes.map((note, index) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  previousNoteTimestamp={index > 0 ? notes[index - 1].timestamp : null}
                  isLast={index === notes.length - 1}
                />
              ))}
               <div ref={notesEndRef} />
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <p className="font-medium">No notes yet.</p>
              <p className="text-sm">Your timestamped journey begins here.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
