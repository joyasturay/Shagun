"use client";

import { useFormStatus } from "react-dom";
import { createGift } from "@/app/actions/gifts";
import { useRef, useState } from "react";
import { toast } from "sonner";
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full py-4 rounded-xl text-lg font-bold text-white shadow-lg transition-transform active:scale-95 ${
        pending ? "bg-gray-400" : "bg-black"
      }`}
    >
      {pending ? "Saving..." : "Save Gift (₹)"}
    </button>
  );
}
export function GiftForm({ batchId }: { batchId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [msg, setMsg] = useState("");

  async function clientAction(formData: FormData) {
    setMsg("");
    const result = await createGift(formData);

    if (result.error) {
      toast.error(result.error);
      setMsg(`❌ ${result.error}`);
    } else {
      toast.message("Saved!");
      formRef.current?.reset();
      if (navigator.vibrate) navigator.vibrate(50);
    }
  }

  return (
    <form
      ref={formRef}
      action={clientAction}
      className="space-y-6 max-w-md mx-auto"
    >
      <input type="hidden" name="batchId" value={batchId} />

      {/* Amount (The big one) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Amount (₹)
        </label>
        <input
          name="amount"
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="500"
          className="w-full text-4xl p-4 border rounded-xl text-center font-bold tracking-widest focus:ring-4 focus:ring-green-100 outline-none border-gray-300"
          required
          autoFocus
        />
      </div>

      {/* Sender & Photo Row */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            From (Optional)
          </label>
          <input
            name="sender"
            type="text"
            placeholder="e.g. Auntie Ji"
            className="w-full p-3 border rounded-lg"
          />
        </div>

        {/* Camera Input (Visual Only for now) */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Photo Evidence
          </label>
          <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <span className="text-gray-500 text-sm">📸 Tap to take photo</span>
            <input
              type="file"
              accept="image/*"
              capture="environment" 
              className="hidden"
              name="photo"
            />
          </label>
        </div>
      </div>

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
