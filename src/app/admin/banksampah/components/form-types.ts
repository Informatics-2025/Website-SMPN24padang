/**
 * Tipe khusus form Bank Sampah.
 * Tipe datanya sendiri ada di `@/types/banksampah` (dipakai bersama halaman publik).
 */

/** State hasil server action form Bank Sampah. */
export type WasteFormState = {
  success: boolean;
  message: string;
};

/** Bentuk `action` yang diterima form (hasil bind juga cocok). */
export type WasteFormAction = (
  state: WasteFormState,
  formData: FormData,
) => Promise<WasteFormState>;
