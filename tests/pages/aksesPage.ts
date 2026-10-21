import { expect, test, type Locator, type Page } from '@playwright/test';
import { ENV, ROUTES, TIMEOUTS } from '../utils/env';
import { UI_TEXT } from '../data/testData';
import type { AksesData } from '../types/akses';
import { BasePage } from './base.page';

/**
 * Page Object untuk halaman Hak & Akses (/roles).
 *
 * Semua interaksi role (tambah, pilih izin, simpan)
 * wajib lewat method di sini. Spec tidak boleh merakit locator mentah.
 */
export class AksesPage extends BasePage {
  private readonly rolesUrl = `${ENV.baseUrl}${ROUTES.roles}`;

  readonly heading: Locator;
  readonly table: Locator;
  readonly addRoleButton: Locator;
  readonly createDialog: Locator;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly selectAllToggles: Locator;
  readonly permissionItems: Locator;
  readonly permissionCountBadge: Locator;
  readonly saveButton: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: UI_TEXT.rolesHeading });
    this.table = page.getByRole('table');
    this.addRoleButton = page.getByRole('button', { name: UI_TEXT.addRoleButton });
    this.createDialog = page.getByRole('dialog', { name: UI_TEXT.createRoleDialog });
    this.nameInput = page.getByRole('textbox', { name: 'Nama Role *' });
    this.descriptionInput = page.getByRole('textbox', { name: 'Deskripsi' });
    // Izin memakai checkbox custom (div), bukan input, jadi dipilih
    // lewat toggle "Pilih Semua" per grup.
    this.selectAllToggles = this.createDialog.getByText('Pilih Semua', { exact: true });
    this.permissionItems = this.createDialog.locator('.group.flex.cursor-pointer.items-start');
    this.permissionCountBadge = this.createDialog.getByText(/\d+ akses dipilih/);
    this.saveButton = page.getByRole('button', { name: 'Buat Role & Simpan Akses' });
    this.successToast = page.getByText(UI_TEXT.createRoleSuccess);
  }

  // ---------- Locator dinamis ----------

  /** Sel nama role (match persis, bukan prefix seperti "Autorole 123"). */
  roleCell(roleName: string): Locator {
    return this.page.getByRole('cell', { name: roleName, exact: true });
  }

  /** Baris tabel role berdasarkan nama. */
  roleRow(roleName: string): Locator {
    return this.table.getByRole('row').filter({ has: this.roleCell(roleName) });
  }

  // ---------- Aksi halaman ----------

  async goto(): Promise<void> {
    await test.step('Buka halaman Hak & Akses', async () => {
      await this.gotoPath(this.rolesUrl);
      await this.expectLoaded();
    });
  }

  async expectLoaded(): Promise<void> {
    await test.step('Halaman hak & akses termuat', async () => {
      await expect(this.heading).toBeVisible({ timeout: TIMEOUTS.list });
      await expect(this.addRoleButton).toBeVisible({ timeout: TIMEOUTS.dialog });
      // Tunggu daftar role ter-render sebelum mengecek role yang sudah ada.
      await expect(this.table.getByRole('row').nth(1)).toBeVisible({ timeout: TIMEOUTS.list });
    });
  }

  /**
   * Cek apakah role dengan nama tersebut sudah ada di tabel.
   *
   * Baris tabel dirender bertahap, jadi `count()` langsung bisa 0
   * padahal role-nya muncul beberapa saat kemudian. Tunggu sebentar
   * sampai baris terlihat; kalau tetap tidak ada berarti belum dibuat.
   */
  async hasRole(roleName: string): Promise<boolean> {
    try {
      await expect(this.roleRow(roleName).first()).toBeVisible({ timeout: TIMEOUTS.existence });
      return true;
    } catch {
      return false;
    }
  }

  async openCreateDialog(): Promise<void> {
    await test.step('Buka form Tambah Role', async () => {
      await this.addRoleButton.click();
      await expect(this.createDialog).toBeVisible({ timeout: TIMEOUTS.dialog });
    });
  }

  async fillCreateForm(data: AksesData): Promise<void> {
    await test.step(`Isi form role "${data.name}"`, async () => {
      await this.nameInput.fill(data.name);
      await this.descriptionInput.fill(data.description);
    });
  }

  async selectAllPermissions(): Promise<void> {
    await test.step('Pilih semua hak akses', async () => {
      const totalGroups = await this.selectAllToggles.count();
      expect(totalGroups, 'grup hak akses harus tersedia').toBeGreaterThan(0);

      for (let i = 0; i < totalGroups; i++) {
        await this.selectAllToggles.nth(i).click();
      }

      const totalPermissions = await this.permissionItems.count();
      await expect(this.permissionCountBadge).toHaveText(`${totalPermissions} akses dipilih`);
    });
  }

  async saveAndConfirm(): Promise<void> {
    await test.step('Simpan role beserta hak akses', async () => {
      await this.saveButton.click();
      await this.expectToastAppearAndDismiss(this.successToast, UI_TEXT.createRoleSuccess);
      await expect(this.createDialog).toBeHidden({ timeout: TIMEOUTS.list });
    });
  }

  async expectCreateSuccess(roleName: string): Promise<void> {
    await test.step(`Role "${roleName}" berhasil dibuat`, async () => {
      await expect(this.roleRow(roleName).first()).toBeVisible({ timeout: TIMEOUTS.list });
    });
  }
}


