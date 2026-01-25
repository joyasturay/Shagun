import { supabase } from "../lib/supabase";
import { SupabaseStorageProvider } from "./SupabaseStorageProvider";
import { EnvelopeService } from "./EnvelopeService";

const sbProvider = new SupabaseStorageProvider(supabase, "envelopes");

export const envelopeService = new EnvelopeService(sbProvider);

