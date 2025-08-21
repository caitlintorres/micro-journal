"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Trash2 } from "lucide-react";

type Mood = {
  id: number;
  time: string;
  category: string;
  description: string;
  created_at: string;
};

const CATEGORIES = [
  "Happy",
  "Sad",
  "Tired",
  "Excited",
  "Stressed",
  "Calm",
  "Grateful",
];

const toDatetimeLocal = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function MicroJournal() {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [time, setTime] = useState(toDatetimeLocal(new Date())); // default to now in local timezone

  const [entries, setEntries] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(false);

  // For modal
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch moods
  useEffect(() => {
    const fetchMoods = async () => {
      const { data, error } = await supabase
        .from("moods")
        .select("*")
        .order("time", { ascending: false });

      if (error) console.error("Error fetching moods:", error);
      else setEntries(data || []);
    };
    fetchMoods();
  }, []);

  // Add mood
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    const utcTime = new Date(time).toISOString(); // convert local input to UTC
  
    const { data, error } = await supabase
      .from("moods")
      .insert([{ category, description, time: utcTime }])
      .select();
  
    if (error) console.error("Error inserting mood:", error);
    else if (data) {
      setEntries((prev) => [...data, ...prev]);
      setCategory(CATEGORIES[0]);
      setDescription("");
      setTime(toDatetimeLocal(new Date())); // reset to now local
    }
  
    setLoading(false);
  };

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
    <div className="max-w-xl mx-auto p-6 space-y-6">
      {/* Entry Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded p-4 space-y-4"
      >
        <h2 className="text-xl font-semibold text-gray-900">Add Today’s Mood</h2>

        {/* Category */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border rounded p-2 text-gray-900"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Date & Time */}
        <input
          type="datetime-local"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full border rounded p-2 text-gray-900"
        />

        {/* Description */}
        <textarea
          placeholder="One line about today..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded p-2 text-gray-900"
          rows={3}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Entry"}
        </button>
      </form>

      {/* History */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white-900">Past Entries</h3>
        {entries.length === 0 ? (
          <p className="text-gray-600">No entries yet.</p>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex justify-between items-start border rounded p-3 bg-gray-50 shadow-sm"
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
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Delete entry"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
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
