import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { QUICK_NOTES } from '@/types';

interface NotesInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export function NotesInput({ value, onChange, maxLength = 200 }: NotesInputProps) {
  const addQuickNote = (note: string) => {
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
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 ${
              isNoteSelected(note.label)
                ? 'border-primary bg-primary/15 text-primary'
                : 'border-border/50 bg-card hover:border-primary/30 text-muted-foreground hover:text-foreground'
            }`}
          >
            {note.emoji} {note.label}
          </button>
        ))}
      </div>
    </div>
  );
}
