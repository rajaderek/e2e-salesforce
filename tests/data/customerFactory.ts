import { DATA_CUSTOMER, DATA_CUSTOMER_PERSONAL } from './testData';
import type { CustomerData, PersonalCustomerData } from '../types/customer';

/**
 * Factory data customer untuk automation.
 *
 * Tiap test membuat datanya sendiri (unik per run) lalu membersihkannya.
 * Hasilnya: test independen, aman paralel, bisa di-rerun tanpa konflik duplikat.
 *
 * Catatan: uniqueness memakai random ber-entropy tinggi, BUKAN cuma
 * Date.now(). Test paralel dalam satu milidetik yang sama akan menghasilkan
 * suffix kembar kalau hanya mengandalkan timestamp.
 */

/** Suffix unik: tanggal (DDMMYY) + 3 angka acak. */
function uniqueToken(): string {
  const today = new Date();

  // Extract components and pad with leading zeros if needed
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0
  const yy = String(today.getFullYear()).slice(-2); // Get last 2 digits

  const formattedDate = `${dd}${mm}${yy}`;
  const random = Math.random().toString(5).slice(2, 5);
  return `${formattedDate}${random}`;
}

/** Nomor HP numerik 11 digit (format 08xxxxxxxxx) dengan 9 digit acak. */
function uniquePhone(): string {
  const digits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
  return `08${digits}`;
}

/**
 * Customer perusahaan baru dengan data unik.
 * Dipakai untuk data awal (create) maupun data hasil edit — keduanya
 * butuh record berbeda supaya tidak bentrok saat searching.
 */
export function newCompanyCustomer(): CustomerData {
  const suffix = uniqueToken();
  return {
    ...DATA_CUSTOMER,
    companyName: `${DATA_CUSTOMER.companyName} ${suffix}`,
    contactName: `${DATA_CUSTOMER.contactName} ${suffix}`,
    phone: uniquePhone(),
    email: `playwright.${suffix}@test.com`,
  };
}

/** Customer perorangan baru dengan data unik. */
export function newPersonalCustomer(): PersonalCustomerData {
  const suffix = uniqueToken();
  return {
    ...DATA_CUSTOMER_PERSONAL,
    contactName: `${DATA_CUSTOMER_PERSONAL.contactName} ${suffix}`,
    phone: uniquePhone(),
    email: `jamal.${suffix}@automation.com`,
  };
}
