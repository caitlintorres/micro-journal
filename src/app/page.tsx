"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

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
  const [loading, setLoading] = useState(false);

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
      setCategory(CATEGORIES[0]);
      setDescription("");
      setTime(toDatetimeLocal(new Date())); // reset to now local
    }
  
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <Link href="/entries">
        <button className="px-4 py-2 rounded border hover:bg-gray-100">
          View Past Entries
        </button>
      </Link></div>
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
    </div>
  );
}
