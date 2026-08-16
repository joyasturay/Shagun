"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { createEvent } from "@/app/actions/event-creation";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Submitbutton } from "@/components/ui/SubmitButton";
import { DashboardShell } from "@/components/ui/dashboard-shell";

type ActionState = {
  error?: string;
  success?: string;
};

const initialState: ActionState = {};

export default function CreateEventPage() {
  const router = useRouter();
  const [subEvents, setSubEvents] = useState([{ name: "", date: "" }]);
  const [state, action] = useActionState(createEvent, initialState);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
    if (state?.success) {
      toast.success("Event created successfully");
      setTimeout(() => router.push("/dashboard"), 1000);
    }
  }, [state, router]);

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
    <DashboardShell
      title="Create new wedding"
      subtitle="Name your event and add the ceremonies you want to track."
      backHref="/dashboard"
      backLabel="Back to command center"
    >
      <form action={action} className="mx-auto max-w-2xl space-y-8">
        <div className="card-surface p-8">
          <label className="label-field">Wedding name</label>
          <input
            name="eventName"
            type="text"
            placeholder="e.g. Sharma Wedding 2026"
            className="input-light"
            required
          />
        </div>

        <div className="card-surface p-8">
          <label className="label-field mb-4 block">Ceremonies</label>
          <div className="space-y-3">
            {subEvents.map((event, index) => (
              <div key={index} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="text"
                  placeholder="Ceremony name"
                  value={event.name}
                  onChange={(e) => handleChange(index, "name", e.target.value)}
                  className="input-light flex-1"
                  required
                />
                <input
                  type="date"
                  value={event.date}
                  onChange={(e) => handleChange(index, "date", e.target.value)}
                  className="input-light sm:w-44"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="btn-inverted px-4 py-3 text-[length:var(--text-label)]"
                  aria-label="Remove ceremony"
                >
                  Remove
                </button>
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
            className="btn-text mt-4 text-[length:var(--text-caption)]"
          >
            + Add another ceremony
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <Submitbutton />
          <Link href="/dashboard" className="btn-inverted">
            Cancel
          </Link>
        </div>
      </form>
    </DashboardShell>
  );
}
