import { test } from '../../fixtures/app.fixtures';
import { DATA_ORGANISASI } from '../../data/testData';
import { STORAGE_STATE } from '../../utils/env';

// Auth sekali via global-setup, tidak perlu login manual per test.
test.use({ storageState: STORAGE_STATE.admin });

test.describe('Organisasi', { tag: '@organisasi' }, () => {
  test.beforeEach(async ({ organisasiPage }) => {
    await organisasiPage.goto();
  });

  test('membuat organisasi baru lalu verifikasi tersimpan', async ({ organisasiPage }) => {
    // Organisasi "Megatron" mungkin sudah dibuat pada run sebelumnya.
    // Jika sudah ada, tidak perlu membuat ulang dan test dianggap lulus.
    if (await organisasiPage.hasOrganization(DATA_ORGANISASI.name)) {
      test.info().annotations.push({
        type: 'existing-organization',
        description: `Organisasi "${DATA_ORGANISASI.name}" sudah ada, tidak membuat organisasi baru`,
      });
      return;
    }

    await organisasiPage.openCreateDialog();
    await organisasiPage.fillCreateForm(DATA_ORGANISASI);
    await organisasiPage.saveAndConfirm();
    await organisasiPage.expectCreateSuccess(DATA_ORGANISASI);
  });
});
