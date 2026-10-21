import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

if (!process.env.CI) {
  dotenv.config();
}


/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  timeout: 50000,
  globalSetup: 'tests/auth/global-setup.ts',

  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  reporter: [
    ['list'],
    ['allure-playwright', {
      outputFolder: 'allure-results',
      detail: true,
      suiteTitle: false,
    }]
  ],


  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 0 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 4 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  // reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */


  /*
   * Urutan running all test:
   * login -> organisasi -> access -> user -> sisanya.
   *
   * Playwright tidak menjamin urutan antar file dalam satu project.
   * Karena itu tiap file prioritas dijadikan project sendiri dan
   * dirangkai lewat `dependencies`, sehingga project berikutnya baru
   * jalan setelah project sebelumnya selesai.
   *
   * Untuk run file tertentu tanpa ikut dependencies:
   *   npx playwright test tests/specs/kelola_user/access.spec.ts --no-deps
   */
  projects: [
    {
      name: '01-login',
      // File prioritas dijalankan berurutan agar tidak saling ganggu sesi login/data.
      fullyParallel: false,
      testMatch: '**/specs/authentication/login.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: '02-organisasi',
      // File prioritas dijalankan berurutan agar tidak saling ganggu sesi login/data.
      fullyParallel: false,
      testMatch: '**/specs/kelola_user/organisasi.spec.ts',
      dependencies: ['01-login'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: '03-access',
      // File prioritas dijalankan berurutan agar tidak saling ganggu sesi login/data.
      fullyParallel: false,
      testMatch: '**/specs/kelola_user/access.spec.ts',
      dependencies: ['02-organisasi'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: '04-user',
      // File prioritas dijalankan berurutan agar tidak saling ganggu sesi login/data.
      fullyParallel: false,
      testMatch: '**/specs/kelola_user/user.spec.ts',
      dependencies: ['03-access'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: '05-others',
      testIgnore: [
        '**/specs/authentication/login.spec.ts',
        '**/specs/kelola_user/organisasi.spec.ts',
        '**/specs/kelola_user/access.spec.ts',
        '**/specs/kelola_user/user.spec.ts',
      ],
      dependencies: ['04-user'],
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
  // Optional: convenience suites grouping. These are not a CLI flag by themselves,
  // but useful as documentation and for other tools. Prefer running suites via
  // npm scripts that point to these folders (examples in package.json).
  metadata: {
    suites: {
      AspekPage: 'tests/aspekmenu/*.spec.ts',
      Authentication: 'tests/authentication/*.spec.ts',
      Karyawan: 'tests/karyawanmenu/*.spec.ts',
      Pengaturan: 'tests/pengaturan/*.spec.ts',
    },
  },
});
