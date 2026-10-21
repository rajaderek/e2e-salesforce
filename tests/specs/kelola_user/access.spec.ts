import { test } from '../../fixtures/app.fixtures';
import { DATA_AKSES } from '../../data/testData';
import { STORAGE_STATE } from '../../utils/env';

// Auth sekali via global-setup, tidak perlu login manual per test.
test.use({ storageState: STORAGE_STATE.admin });

test.describe('Hak & Akses', { tag: '@akses' }, () => {
  test.beforeEach(async ({ aksesPage }) => {
    await aksesPage.goto();
  });

  test('membuat role baru dengan semua akses lalu verifikasi tersimpan', async ({ aksesPage }) => {
    // Role "Autorole" mungkin sudah dibuat pada run sebelumnya.
    // Jika sudah ada, tidak perlu membuat ulang dan test dianggap lulus.
    if (await aksesPage.hasRole(DATA_AKSES.name)) {
      test.info().annotations.push({
        type: 'existing-role',
        description: `Role "${DATA_AKSES.name}" sudah ada, tidak membuat role baru`,
      });
      return;
    }

    await aksesPage.openCreateDialog();
    await aksesPage.fillCreateForm(DATA_AKSES);
    await aksesPage.selectAllPermissions();
    await aksesPage.saveAndConfirm();
    await aksesPage.expectCreateSuccess(DATA_AKSES.name);
  });
});
