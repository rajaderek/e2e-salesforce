import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { ProductPage } from '../pages/productPage';
import { CustomerPage } from '../pages/customerPage';
import { KunjunganPage } from '../pages/kunjunganPage';
import { ActivityPage } from '../pages/activityPage';
import { ProspectPage } from '../pages/prospectPage';
import { OrganisasiPage } from '../pages/organisasiPage';
import { AksesPage } from '../pages/aksesPage';
import { UserPage } from '../pages/userPage';

/**
 * Fixture aplikasi.
 *
 * Kenapa fixture?
 * - Spec tidak perlu `new LoginPage(page)` berulang.
 * - Cukup tulis `async ({ loginPage }) => ...`.
 * - Gampang ditambah (mis. apiContext, role tertentu) tanpa ubah semua spec.
 *
 * Cara pakai di spec:
 *   import { test, expect } from '../../fixtures/app.fixtures';
 */
type AppFixtures = {
  loginPage: LoginPage;
  productPage: ProductPage;
  customerPage: CustomerPage;
  kunjunganPage: KunjunganPage;
  activityPage: ActivityPage;
  prospectPage: ProspectPage;
  organisasiPage: OrganisasiPage;
  aksesPage: AksesPage;
  userPage: UserPage;
};

export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  customerPage: async ({ page }, use) => {
    await use(new CustomerPage(page));
  },
  kunjunganPage: async ({ page }, use) => {
    await use(new KunjunganPage(page));
  },
  activityPage: async ({ page }, use) => {
    await use(new ActivityPage(page));
  },
  prospectPage: async ({ page }, use) => {
    await use(new ProspectPage(page));
  },
  organisasiPage: async ({ page }, use) => {
    await use(new OrganisasiPage(page));
  },
  aksesPage: async ({ page }, use) => {
    await use(new AksesPage(page));
  },
  userPage: async ({ page }, use) => {
    await use(new UserPage(page));
  },
});

export { expect } from '@playwright/test';
