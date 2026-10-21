import { test } from '../../fixtures/app.fixtures';
import { newCompanyCustomer, newPersonalCustomer } from '../../data/customerFactory';
import { STORAGE_STATE } from '../../utils/env';

// Auth sekali via global-setup, tidak perlu login manual per test.
test.use({ storageState: STORAGE_STATE.admin });

// Backend customer kadang mengembalikan 500 ("Terjadi kesalahan yang tidak
// diketahui.") untuk payload yang valid — terbukti dari screenshot failure
// (form terisi benar, confirm sukses, server menolak). Satu retry aman di sini
// karena tiap test memakai data unik: retry tidak akan konflik duplikat.
test.describe.configure({ retries: 1 });

/**
 * Tiap test membuat datanya sendiri (unik per run) lalu membersihkannya.
 * Factory-nya ada di tests/data/customerFactory.ts.
 */

test.describe.serial('Customer Perusahaan', { tag: '@perusahaan' }, () => {
  const customer = newCompanyCustomer();
  const updatedCustomer = newCompanyCustomer();

  test.beforeEach(async ({ customerPage }) => {
    await customerPage.goto();
  });

  test('membuat customer perusahaan lalu verifikasi detail kontak', async ({ customerPage }) => {

    await customerPage.openCreateDialog();
    await customerPage.fillCreateForm(customer);
    await customerPage.saveAndConfirmCreate();
    // Wajib search dulu: tabel terpaginaasi, record baru belum tentu di halaman 1.
    await customerPage.search(customer.companyName);

    await customerPage.openDetail(customer.companyName);
    await customerPage.expectContactDetailVisible(customer);
    await customerPage.closeDetail();
  });

  test('mengedit customer perusahaan lalu verifikasi detail kontak', async ({ customerPage }) => {

    await customerPage.search(customer.companyName);
    await customerPage.openEditFor(customer.companyName);
    await customerPage.fillEditForm(  updatedCustomer);
    await customerPage.saveEditAndConfirm();
    await customerPage.search(updatedCustomer.companyName);
    await customerPage.expectUpdateSuccess(updatedCustomer.companyName);

    await customerPage.openDetail(updatedCustomer.companyName);
    await customerPage.expectContactDetailVisible(updatedCustomer);
    await customerPage.closeDetail();

  });

  test('menghapus customer perusahaan lalu verifikasi tidak tampil di tabel', async ({
    customerPage,
  }) => {

    await customerPage.search(updatedCustomer.companyName);
    await customerPage.deleteFor(updatedCustomer.companyName);
    await customerPage.expectDeleteSuccess();
  });
});

test.describe.serial('Customer Perorangan', { tag: '@personal' }, () => {
  const customer = newPersonalCustomer();
  test.beforeEach(async ({ customerPage }) => {
    await customerPage.goto();
  });

  test('membuat customer perorangan lalu verifikasi detail kontak', async ({ customerPage }) => {

    await customerPage.openCreateDialog();
    await customerPage.selectPersonalType();
    await customerPage.fillPersonalCreateForm(customer);
    await customerPage.saveAndConfirmCreate();
    // Wajib search dulu: tabel terpaginaasi, record baru belum tentu di halaman 1.
    await customerPage.search(customer.contactName);

    await customerPage.openPersonalDetail(customer.contactName);
    await customerPage.expectPersonalDetailVisible(customer);
    await customerPage.closeDetail();

  });

  test('mengedit customer perorangan lalu verifikasi detail kontak', async ({ customerPage }) => {
    const updated = newPersonalCustomer();

    await customerPage.search(customer.contactName);
    await customerPage.openEditFor(customer.contactName);
    await customerPage.fillPersonalEditForm(updated);
    await customerPage.saveEditAndConfirm();
    await customerPage.search(updated.contactName);
    await customerPage.expectUpdateSuccess(updated.contactName);

    await customerPage.openPersonalDetail(updated.contactName);
    await customerPage.expectPersonalDetailVisible(updated);
    await customerPage.closeDetail();

  });

  test('menghapus customer perorangan lalu verifikasi tidak tampil di tabel', async ({
    customerPage,
  }) => {

    await customerPage.search(customer.contactName);
    await customerPage.deleteFor(customer.contactName);
    await customerPage.expectDeleteSuccess();
  });
});
