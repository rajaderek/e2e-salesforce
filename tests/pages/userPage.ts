import { expect, test, type Locator, type Page } from '@playwright/test';
import { ENV, ROUTES, TIMEOUTS } from '../utils/env';
import { UI_TEXT } from '../data/testData';
import type { UserData } from '../types/user';
import { BasePage } from './base.page';

/**
 * Page Object untuk halaman User Management (/usermanagement).
 *
 * Semua interaksi user (tambah, pilih role/organisasi, unggah foto,
 * tanda tangan) wajib lewat method di sini. Spec tidak boleh merakit
 * locator mentah.
 */
export class UserPage extends BasePage {
  private readonly usersUrl = `${ENV.baseUrl}${ROUTES.users}`;

  readonly heading: Locator;
  readonly table: Locator;
  readonly addButton: Locator;
  readonly createDialog: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly roleCombobox: Locator;
  readonly passwordInput: Locator;
  readonly photoInput: Locator;
  readonly cropDialog: Locator;
  readonly savePhotoButton: Locator;
  readonly signatureButton: Locator;
  readonly signatureDialog: Locator;
  readonly signatureCanvas: Locator;
  readonly saveSignatureButton: Locator;
  readonly signaturePreview: Locator;
  readonly submitButton: Locator;
  readonly confirmDialog: Locator;
  readonly confirmButton: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: UI_TEXT.usersHeading });
    this.table = page.getByRole('table');
    this.addButton = page.getByRole('button', { name: UI_TEXT.addUserButton });
    this.createDialog = page.getByRole('dialog', { name: UI_TEXT.createUserDialog });
    this.nameInput = this.createDialog.getByRole('textbox', { name: 'Nama Lengkap' });
    this.emailInput = this.createDialog.getByRole('textbox', { name: 'Email' });
    this.phoneInput = this.createDialog.getByRole('textbox', { name: /Masukkan nomor HP/ });
    this.roleCombobox = this.createDialog.getByRole('combobox');
    this.passwordInput = this.createDialog.locator('input[name="password"]');
    this.photoInput = this.createDialog.locator('input[type="file"]');
    this.cropDialog = page.getByRole('dialog', { name: 'Sesuaikan Foto' });
    this.savePhotoButton = this.cropDialog.getByRole('button', { name: 'Simpan Foto' });
    this.signatureButton = this.createDialog.getByRole('button', { name: 'Gambar TTD' });
    this.signatureDialog = page.getByRole('dialog', { name: 'Gambar Tanda Tangan' });
    this.signatureCanvas = this.signatureDialog.locator('canvas');
    this.saveSignatureButton = this.signatureDialog.getByRole('button', { name: 'Simpan TTD' });
    this.signaturePreview = this.createDialog.getByRole('img', { name: 'Preview Tanda Tangan' });
    this.submitButton = this.createDialog.getByRole('button', { name: 'Buat User' });
    this.confirmDialog = page.getByRole('alertdialog', { name: UI_TEXT.createUserConfirm });
    this.confirmButton = page.locator('[data-test="confirm-button"]');
    this.successToast = page.getByText(UI_TEXT.createUserSuccess);
  }

  // ---------- Locator dinamis ----------

  /** Opsi dropdown role berdasarkan nama. */
  roleOption(roleName: string): Locator {
    return this.page.getByRole('option', { name: roleName, exact: true });
  }

  /** Checkbox organisasi berdasarkan nama. */
  organizationCheckbox(organizationName: string): Locator {
    return this.createDialog.getByRole('checkbox', {
      name: new RegExp(organizationName, 'i'),
    });
  }

  /** Baris tabel user berdasarkan email (unik per user). */
  userRow(email: string): Locator {
    return this.table.getByRole('row', { name: new RegExp(escapeRegExp(email), 'i') });
  }

  // ---------- Aksi halaman ----------

  async goto(): Promise<void> {
    await test.step('Buka halaman User Management', async () => {
      await this.gotoPath(this.usersUrl);
      await this.expectLoaded();
    });
  }

  async expectLoaded(): Promise<void> {
    await test.step('Halaman user management termuat', async () => {
      await expect(this.heading).toBeVisible({ timeout: TIMEOUTS.list });
      await expect(this.addButton).toBeVisible({ timeout: TIMEOUTS.dialog });
      // Tunggu daftar user ter-render sebelum mengecek user yang sudah ada.
      await expect(this.table.getByRole('row').nth(1)).toBeVisible({ timeout: TIMEOUTS.list });
    });
  }

  /**
   * Cek apakah user dengan email tersebut sudah ada.
   *
   * Baris tabel dirender bertahap, jadi tunggu sebentar; kalau tetap
   * tidak ada berarti user belum dibuat.
   */
  async hasUser(email: string): Promise<boolean> {
    try {
      await expect(this.userRow(email).first()).toBeVisible({ timeout: TIMEOUTS.existence });
      return true;
    } catch {
      return false;
    }
  }

  async openCreateDialog(): Promise<void> {
    await test.step('Buka form Tambah Pengguna', async () => {
      await this.addButton.click();
      await expect(this.createDialog).toBeVisible({ timeout: TIMEOUTS.dialog });
    });
  }

  async fillCreateForm(data: UserData): Promise<void> {
    await test.step(`Isi form user "${data.email}"`, async () => {
      await this.nameInput.fill(data.name);
      await this.emailInput.fill(data.email);
      await this.phoneInput.fill(data.phone);

      await this.roleCombobox.click();
      await expect(this.roleOption(data.role)).toBeVisible({ timeout: TIMEOUTS.dialog });
      await this.roleOption(data.role).click();
      await expect(this.createDialog).toBeVisible({ timeout: TIMEOUTS.dialog });

      await this.organizationCheckbox(data.organization).click();
      await this.passwordInput.fill(data.password);
    });
  }

  async uploadPhoto(photoPath: string): Promise<void> {
    await test.step('Unggah dan simpan foto profil', async () => {
      await this.photoInput.setInputFiles(photoPath);
      await expect(this.cropDialog).toBeVisible({ timeout: TIMEOUTS.dialog });
      await this.savePhotoButton.click();
      await expect(this.cropDialog).toBeHidden({ timeout: TIMEOUTS.list });
      await expect(this.createDialog).toBeVisible({ timeout: TIMEOUTS.dialog });
    });
  }

  async drawSignature(): Promise<void> {
    await test.step('Gambar dan simpan tanda tangan', async () => {
      await this.signatureButton.click();
      await expect(this.signatureDialog).toBeVisible({ timeout: TIMEOUTS.dialog });

      const box = await this.signatureCanvas.boundingBox();
      expect(box, 'area tanda tangan harus terlihat').not.toBeNull();
      if (!box) return;

      await this.page.mouse.move(box.x + 40, box.y + 80);
      await this.page.mouse.down();
      await this.page.mouse.move(box.x + 150, box.y + 30, { steps: 20 });
      await this.page.mouse.move(box.x + 260, box.y + 120, { steps: 20 });
      await this.page.mouse.up();

      await this.saveSignatureButton.click();
      await expect(this.signatureDialog).toBeHidden({ timeout: TIMEOUTS.list });
      await expect(this.signaturePreview).toBeVisible({ timeout: TIMEOUTS.dialog });
    });
  }

  async saveAndConfirm(): Promise<void> {
    await test.step('Simpan dan konfirmasi pembuatan user', async () => {
      await this.submitButton.click();
      await expect(this.confirmDialog).toBeVisible({ timeout: TIMEOUTS.dialog });
      await this.confirmButton.click();
      await this.expectToastAppearAndDismiss(this.successToast, UI_TEXT.createUserSuccess);
      await expect(this.createDialog).toBeHidden({ timeout: TIMEOUTS.list });
    });
  }

  async expectCreateSuccess(data: UserData): Promise<void> {
    await test.step(`User "${data.email}" berhasil dibuat`, async () => {
      const row = this.userRow(data.email).first();
      await expect(row).toBeVisible({ timeout: TIMEOUTS.list });
      await expect(row.getByText(data.name, { exact: true })).toBeVisible();
    });
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
