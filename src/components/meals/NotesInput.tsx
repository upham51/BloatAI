import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { QUICK_NOTES } from '@/types';
import { haptics } from '@/lib/haptics';

interface NotesInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export function NotesInput({ value, onChange, maxLength = 200 }: NotesInputProps) {
  const addQuickNote = (note: string) => {
    haptics.light();
    const currentNotes = value.trim();
    if (currentNotes.toLowerCase().includes(note.toLowerCase())) {
      // Remove the note if it's already there
      const regex = new RegExp(`${note},?\\s*`, 'gi');
      onChange(currentNotes.replace(regex, '').replace(/,\s*$/, '').trim());
    } else {
      // Add the note
      const newNotes = currentNotes ? `${currentNotes}, ${note}` : note;
      onChange(newNotes.slice(0, maxLength));
    }
  };

  const isNoteSelected = (note: string) => {
    return value.toLowerCase().includes(note.toLowerCase());
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">📝</span>
        <label className="text-sm font-semibold text-foreground">
          Add notes <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
      </div>
      
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder="How do you feel? Any other context..."
        rows={3}
        className="resize-none bg-muted/30 border-border/50 rounded-2xl"
      />
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Quick add:</span>
        <span className="text-xs text-muted-foreground">{value.length}/{maxLength}</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {QUICK_NOTES.map((note) => (
          <button
            key={note.label}
            type="button"
            onClick={() => addQuickNote(note.label)}
            className={`px-4 py-2.5 text-sm font-semibold rounded-xl border-2 transition-all duration-200 active:scale-95 ${
              isNoteSelected(note.label)
                ? 'border-primary bg-primary text-primary-foreground shadow-md scale-105'
                : 'border-border/50 bg-card hover:border-primary/50 hover:bg-primary/5 text-foreground'
            }`}
            style={
              isNoteSelected(note.label)
                ? { boxShadow: '0 4px 12px hsl(var(--primary) / 0.25)' }
                : undefined
            }
          >
            <span className="text-base mr-2">{note.emoji}</span>
            {note.label}
          </button>
        ))}
      </div>
    </div>
  );
}
