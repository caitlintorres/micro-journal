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


// Map moods to emojis
export const MOOD_EMOJIS: Record<string, string> = {
    Happy: "😀",
    Sad: "😢",
    Tired: "😴",
    Excited: "🤩",
    Stressed: "😫",
    Calm: "😌",
    Grateful: "🙏",
  };
  

export default function EntriesPage() {
  const [entries, setEntries] = useState<Mood[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [filter, setFilter] = useState<string>("All");
  const [monthlyCounts, setMonthlyCounts] = useState<Record<string, number>>({});


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

        // Count moods for the current month
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();

        const counts: Record<string, number> = {};
        (data || []).forEach((entry) => {
          const entryDate = new Date(entry.time);
          if (
            entryDate.getMonth() === month &&
            entryDate.getFullYear() === year
          ) {
            counts[entry.category] = (counts[entry.category] || 0) + 1;
          }
        });
        setMonthlyCounts(counts);
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

    // Apply filter
    const displayedEntries =
    filter === "All"
      ? entries
      : entries.filter((entry) => entry.category === filter);

  const uniqueCategories = Array.from(
    new Set(entries.map((entry) => entry.category))
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Top bar with back + sort */}
      <div className="flex justify-between items-center mb-4">
        <Link href="/">
          <button className="px-4 py-2 rounded border hover:bg-blue-600">
            ← Back to Journal
          </button>
        </Link>
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="px-4 py-2 rounded border hover:bg-blue-600"
        >
          Sort: {sortOrder === "asc" ? "Oldest First" : "Newest First"}
        </button>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 rounded border hover:bg-blue-600"
        >
          <option value="All">All Moods</option>
          {uniqueCategories.map((cat) => (
            <option key={cat} value={cat}>
              {MOOD_EMOJIS[cat] || "❓"} {cat}
            </option>
          ))}
        </select>
      </div>

      <h1 className="text-2xl font-bold mb-4">Past Entries</h1>

      {/* Monthly mood tracker */}
      <div className="mb-6 p-4 border rounded bg-black">
        <h2 className="text-lg font-semibold mb-2">This Month’s Mood Tracker</h2>
        {Object.keys(monthlyCounts).length === 0 ? (
          <p className="text-gray-600 text-sm">No entries yet this month.</p>
        ) : (
          <ul className="space-y-1">
            {Object.entries(monthlyCounts).map(([mood, count]) => (
              <li key={mood} className="flex justify-between">
                <span>
                  {MOOD_EMOJIS[mood] || "❓"} {mood}
                </span>
                <span className="font-semibold">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-4">
        {displayedEntries.map((entry) => (
          <div
            key={entry.id}
            className="p-4 border rounded bg-white flex justify-between items-start"
          >
            <div>
                <p className="font-semibold text-gray-900">
                    {MOOD_EMOJIS[entry.category] || "❓"} {entry.category}
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
