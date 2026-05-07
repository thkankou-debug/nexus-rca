// Helpers Storage pour le module RH (buckets hr-documents + employee-payslips).
// Utilise SUPABASE_SERVICE_ROLE_KEY pour bypass RLS côté serveur uniquement.

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const HR_DOCUMENTS_BUCKET = "hr-documents";
export const PAYSLIPS_BUCKET = "employee-payslips";

export function getStorageAdminClient() {
  if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "[RH_STORAGE] NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquante"
    );
  }
  return createSupabaseClient(
    NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function uploadHrDocument(opts: {
  employeeId: string;
  file: ArrayBuffer | Uint8Array;
  fileName: string;
  mimeType: string;
}): Promise<{ path: string }> {
  const safeFileName = opts.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${opts.employeeId}/${Date.now()}-${safeFileName}`;

  const supabase = getStorageAdminClient();
  const { error } = await supabase.storage
    .from(HR_DOCUMENTS_BUCKET)
    .upload(path, opts.file, {
      contentType: opts.mimeType,
      upsert: false,
    });

  if (error) {
    throw new Error(`[RH_STORAGE] upload hr-document: ${error.message}`);
  }
  return { path };
}

export async function uploadPayslipPdf(opts: {
  employeeId: string;
  payslipId: string;
  reference: string;
  pdfBytes: Uint8Array;
}): Promise<{ path: string }> {
  const path = `${opts.employeeId}/${opts.reference}.pdf`;

  const supabase = getStorageAdminClient();
  const { error } = await supabase.storage
    .from(PAYSLIPS_BUCKET)
    .upload(path, opts.pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) {
    throw new Error(`[RH_STORAGE] upload payslip pdf: ${error.message}`);
  }
  return { path };
}

export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresInSeconds = 600
): Promise<string> {
  const supabase = getStorageAdminClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(
      `[RH_STORAGE] signed url ${bucket}/${path}: ${error?.message ?? "unknown"}`
    );
  }
  return data.signedUrl;
}

export async function deleteFromStorage(
  bucket: string,
  path: string
): Promise<void> {
  const supabase = getStorageAdminClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    throw new Error(`[RH_STORAGE] delete ${bucket}/${path}: ${error.message}`);
  }
}
