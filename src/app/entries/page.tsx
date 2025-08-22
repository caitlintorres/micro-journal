"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Trash2 } from "lucide-react";

interface Mood {
  id: number;
  category: string;
  description: string;
  time: string;
}

export default function EntriesPage() {
  const [entries, setEntries] = useState<Mood[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  // For modal
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);


  useEffect(() => {
    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from("moods")
        .select("*")
        .order("time", { ascending: sortOrder === "asc" });

      if (error) {
        console.error(error);
      } else {
        setEntries(data || []);
      }
    };

    fetchEntries();
  }, [sortOrder]);


 // Confirm delete
 const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);

    const { error } = await supabase.from("moods").delete().eq("id", deleteId);

    if (error) {
      console.error("Error deleting mood:", error);
    } else {
      setEntries((prev) => prev.filter((entry) => entry.id !== deleteId));
    }

    setDeleting(false);
    setDeleteId(null);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Top bar with back + sort */}
      <div className="flex justify-between items-center mb-4">
        <Link href="/">
          <button className="px-4 py-2 rounded border hover:bg-gray-100">
            ← Back to Journal
          </button>
        </Link>
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="px-4 py-2 rounded border hover:bg-gray-100"
        >
          Sort: {sortOrder === "asc" ? "Oldest First" : "Newest First"}
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-4">Past Entries</h1>

      <div className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="p-4 border rounded bg-white flex justify-between items-start"
          >
            <div>
                  <p className="font-semibold text-gray-900">
                    {entry.category}
                  </p>
                  <p className="text-sm text-gray-900">{entry.description}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(entry.time).toLocaleString()}
                  </p>
            </div>
            <button
              onClick={() => setDeleteId(entry.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    {/* Confirmation Modal */}
    {deleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-80 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Delete Entry?
            </h2>
            <p className="text-sm text-gray-700">
              Are you sure you want to delete this mood entry? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
