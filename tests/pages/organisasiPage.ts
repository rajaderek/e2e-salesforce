import { expect, test, type Locator, type Page } from '@playwright/test';
import { ENV, ROUTES, TIMEOUTS } from '../utils/env';
import { UI_TEXT } from '../data/testData';
import type { OrganisasiData } from '../types/organisasi';
import { BasePage } from './base.page';

/**
 * Page Object untuk halaman Organisasi (/organization).
 *
 * Semua interaksi organisasi (tambah, unggah logo, konfirmasi)
 * wajib lewat method di sini. Spec tidak boleh merakit locator mentah.
 */
export class OrganisasiPage extends BasePage {
  private readonly organizationUrl = `${ENV.baseUrl}${ROUTES.organization}`;

  readonly heading: Locator;
  readonly addButton: Locator;
  readonly createHeading: Locator;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly logoInput: Locator;
  readonly logoPreview: Locator;
  readonly prefixInput: Locator;
  readonly saveButton: Locator;
  readonly createConfirmDialog: Locator;
  readonly confirmButton: Locator;
  readonly completeDialog: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: UI_TEXT.manageOrganizationHeading });
    this.addButton = page.getByRole('button', { name: UI_TEXT.addOrganizationDialog });
    this.createHeading = page.getByRole('heading', { name: UI_TEXT.addOrganizationDialog });
    this.nameInput = page.getByRole('textbox', { name: 'Nama Organisasi' });
    this.descriptionInput = page.getByRole('textbox', { name: 'Deskripsi' });
    this.logoInput = page.getByRole('button', { name: 'Logo' });
    this.logoPreview = page.getByRole('img', { name: 'Preview' });
    this.prefixInput = page.getByRole('textbox', { name: 'Penamaan Tengah Surat *' });
    this.saveButton = page.getByRole('button', { name: 'Simpan' });
    this.completeDialog = page.getByRole('dialog', { name: UI_TEXT.completeOrganizationSuccess });
    this.createConfirmDialog = page.getByRole('alertdialog', {
      name: UI_TEXT.createOrganizationConfirm,
    });
    this.confirmButton = page.locator('[data-test="confirm-button"]');
  }

  // ---------- Locator dinamis ----------

  organizationHeading(name: string): Locator {
    return this.page.getByRole('heading', { name });
  }

  // ---------- Aksi halaman ----------

  async goto(): Promise<void> {
    await test.step('Buka halaman Organisasi', async () => {
      await this.gotoPath(this.organizationUrl);
      await this.expectLoaded();
    });
  }

  async expectLoaded(): Promise<void> {
    await test.step('Halaman organisasi termuat', async () => {
      await expect(this.heading).toBeVisible({ timeout: TIMEOUTS.list });
      await expect(this.addButton).toBeVisible({ timeout: TIMEOUTS.dialog });
    });
  }

  /**
   * Cek apakah organisasi dengan nama tersebut sudah ada.
   *
   * Kartu organisasi bisa muncul beberapa saat setelah halaman termuat,
   * jadi tunggu sebentar; kalau tetap tidak ada berarti belum dibuat.
   */
  async hasOrganization(name: string): Promise<boolean> {
    try {
      await expect(this.organizationHeading(name)).toBeVisible({ timeout: TIMEOUTS.existence });
      return true;
    } catch {
      return false;
    }
  }

  async openCreateDialog(): Promise<void> {
    await test.step('Buka form Tambah Organisasi', async () => {
      await this.addButton.click();
      await expect(this.createHeading).toBeVisible({ timeout: TIMEOUTS.dialog });
    });
  }

  async fillCreateForm(data: OrganisasiData): Promise<void> {
    await test.step(`Isi form organisasi "${data.name}"`, async () => {
      await this.nameInput.fill(data.name);
      await this.descriptionInput.fill(data.description);

      await this.logoInput.click();
      await this.logoInput.setInputFiles(data.logoPath);
      await expect(this.logoPreview).toBeVisible({ timeout: TIMEOUTS.dialog });

      await this.prefixInput.fill(data.prefix);
    });
  }

  async saveAndConfirm(): Promise<void> {
    await test.step('Simpan dan konfirmasi pembuatan organisasi', async () => {
      await this.saveButton.click();
      await expect(this.createConfirmDialog).toBeVisible({ timeout: TIMEOUTS.dialog });
      await this.confirmButton.click();
      await this.expectToastAppearAndDismiss(this.completeDialog, UI_TEXT.completeOrganizationSuccess);
    });
  }

  async expectCreateSuccess(data: OrganisasiData): Promise<void> {
    await test.step(`Organisasi "${data.name}" berhasil dibuat`, async () => {
      await expect(this.organizationHeading(data.name)).toBeVisible({ timeout: TIMEOUTS.list });
      await expect(this.page.getByText(data.description)).toBeVisible();
      await expect(this.page.getByText(`Prefix: ${data.prefix.toUpperCase()}`)).toBeVisible();
    });
  }
}
