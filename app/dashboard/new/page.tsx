"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { createEvent } from "@/app/actions/event-creation";
import { toast } from "sonner";
import Link from "next/link";

type ActionState = {
    error?: string;
};

const initialState: ActionState = {};

export default function CreateEventPage() {
  const [subEvents, setSubEvents] = useState([{ name: "", date: "" }]);

  const [state, action] = useActionState(createEvent, initialState);
  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  const handleChange = (
    index: number,
    field: "name" | "date",
    value: string
  ) => {
    const newEvents = [...subEvents];
    newEvents[index][field] = value;
    setSubEvents(newEvents);
  };

  const addRow = () => {
    setSubEvents([...subEvents, { name: "", date: "" }]);
  };

  const removeRow = (index: number) => {
    if (subEvents.length === 1) return;
    setSubEvents(subEvents.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Create New Wedding</h1>

      {/* ✅ SERVER ACTION VIA useActionState */}
      <form action={action} className="space-y-6">
        {/* EVENT NAME */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Wedding Name
          </label>
          <input
            name="eventName"
            type="text"
            placeholder="e.g. Sharma Wedding 2026"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <hr />

        {/* SUB EVENTS */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Ceremonies
          </label>

          <div className="space-y-3">
            {subEvents.map((event, index) => (
              <div key={index} className="flex gap-2 items-start">
                <input
                  type="text"
                  placeholder="Ceremony Name"
                  value={event.name}
                  onChange={(e) =>
                    handleChange(index, "name", e.target.value)
                  }
                  className="flex-1 p-2 border rounded"
                  required
                />

                <input
                  type="date"
                  value={event.date}
                  onChange={(e) =>
                    handleChange(index, "date", e.target.value)
                  }
                  className="p-2 border rounded"
                  required
                />

                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  ✕
                </button>

                {/* 🔑 THIS is what the server reads */}
                <input
                  type="hidden"
                  name="subEvents"
                  value={JSON.stringify(event)}
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addRow}
            className="mt-4 text-sm text-blue-600 font-medium hover:underline"
          >
            + Add Another Ceremony
          </button>
        </div>

        <hr />

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
          >
            Create Event
          </button>

          <Link
            href="/dashboard"
            className="px-6 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
