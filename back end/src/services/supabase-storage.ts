import { createClient, SupabaseClient } from '@supabase/supabase-js';
import logger from '../utils/logger';

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios');
    client = createClient(url, key);
  }
  return client;
}

export const supabaseStorage = {
  async uploadBuffer(
    bucket: string,
    path: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string | null> {
    const sb = getClient();
    const { error } = await sb.storage
      .from(bucket)
      .upload(path, buffer, { contentType, upsert: true });

    if (error) {
      logger.error(`[SupabaseStorage] Erro upload ${path}:`, error.message);
      return null;
    }

    const { data } = sb.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl ?? null;
  },

  async deleteFile(bucket: string, path: string): Promise<boolean> {
    const sb = getClient();
    const { error } = await sb.storage.from(bucket).remove([path]);
    if (error) {
      logger.error(`[SupabaseStorage] Erro delete ${path}:`, error.message);
      return false;
    }
    return true;
  },
};
