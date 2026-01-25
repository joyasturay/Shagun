import { IStorageProvider } from "../interfaces/IStorageProvider";
import { SupabaseClient } from "@supabase/supabase-js"

export class SupabaseStorageProvider implements IStorageProvider{
    constructor(
        private supabase: SupabaseClient,
        private bucket:string
    ) { }
    async uploadFile(file: File, path: string): Promise<void> {
        const { error } = await this.supabase.storage.from(this.bucket).upload(path, file)
        if(error) throw error
    }
    getPublicUrl(path: string): string {
        const { data } = this.supabase.storage.from(this.bucket).getPublicUrl(path)
        return data.publicUrl
    }
}