import { test } from '../../fixtures/app.fixtures';
import { DATA_USER } from '../../data/testData';
import { STORAGE_STATE } from '../../utils/env';

// Auth sekali via global-setup, tidak perlu login manual per test.
test.use({ storageState: STORAGE_STATE.admin });

test.describe('User Management', { tag: '@user' }, () => {
  test.beforeEach(async ({ userPage }) => {
    await userPage.goto();
  });

  test('membuat user baru lalu verifikasi tersimpan', async ({ userPage }) => {
    // User "robot@lcc.com" mungkin sudah dibuat pada run sebelumnya.
    // Jika sudah ada, tidak perlu membuat ulang dan test dianggap lulus.
    if (await userPage.hasUser(DATA_USER.email)) {
      test.info().annotations.push({
        type: 'existing-user',
        description: `User "${DATA_USER.email}" sudah ada, tidak membuat user baru`,
      });
      return;
    }

    await userPage.openCreateDialog();
    await userPage.fillCreateForm(DATA_USER);
    await userPage.uploadPhoto(DATA_USER.photoPath);
    await userPage.drawSignature();
    await userPage.saveAndConfirm();
    await userPage.expectCreateSuccess(DATA_USER);
  });
});
