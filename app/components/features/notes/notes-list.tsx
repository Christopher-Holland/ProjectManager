"use client";

import { useEffect, useState } from "react";
import NoteCard from "./card";
import { useToast } from "@/app/components/ui/toast";

interface Note {
    id: string;
    title: string;
    content?: string | null;
    tags?: string | null;
    pinned: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
}

interface NotesListProps {
    refreshKey?: number;
}

export default function NotesList({ refreshKey }: NotesListProps = {}) {
    const { showToast } = useToast();
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNotes() {
            try {
                const response = await fetch("/api/notes");
                if (response.ok) {
                    const data = await response.json();
                    console.log("Notes fetched:", data);
                    setNotes(data);
                } else {
                    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
                    console.error("Failed to fetch notes:", response.status, errorData);
                    showToast(`Failed to load notes: ${errorData.error || "Unknown error"}`, "error");
                }
            } catch (error) {
                console.error("Error fetching notes:", error);
                showToast("Error loading notes", "error");
            } finally {
                setLoading(false);
            }
        }

        fetchNotes();
    }, [showToast, refreshKey]);

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/notes/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setNotes((prev) => prev.filter((note) => note.id !== id));
                showToast("Note deleted successfully", "success");
            } else {
                showToast("Failed to delete note", "error");
            }
        } catch (error) {
            console.error("Error deleting note:", error);
            showToast("Error deleting note", "error");
        }
    };

    const handleUpdate = async (id: string, data: {
        title: string;
        content?: string;
        tags?: string;
        pinned?: boolean;
    }) => {
        try {
            const response = await fetch(`/api/notes/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const updatedNote = await response.json();
                setNotes((prev) =>
                    prev.map((note) => (note.id === id ? {
                        ...note,
                        ...updatedNote,
                    } : note))
                );
                showToast("Note updated successfully", "success");
            } else {
                const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
                console.error("Failed to update note:", errorData);
                showToast(`Failed to update note: ${errorData.error || "Unknown error"}`, "error");
            }
        } catch (error) {
            console.error("Error updating note:", error);
            showToast("Error updating note", "error");
        }
    };

    if (loading) {
        return <div className="text-gray-600 dark:text-gray-400">Loading notes...</div>;
    }

    // Sort notes: pinned first, then by updated date
    const sortedNotes = [...notes].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        return dateB - dateA;
    });

    return (
        <div className="flex flex-col gap-4">
            {sortedNotes.length === 0 ? (
                <div className="col-span-full text-sm text-gray-500 dark:text-gray-400 italic">
                    No notes yet. Create your first note!
                </div>
            ) : (
                sortedNotes.map((note) => (
                    <NoteCard
                        key={note.id}
                        id={note.id}
                        title={note.title}
                        content={note.content}
                        tags={note.tags}
                        pinned={note.pinned}
                        createdAt={note.createdAt}
                        updatedAt={note.updatedAt}
                        onDelete={handleDelete}
                        onUpdate={handleUpdate}
                    />
                ))
            )}
        </div>
    );
}

