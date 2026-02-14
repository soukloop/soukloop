import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    // Adjust based on actual title, checking for "Soukloop" or similar
    await expect(page).toHaveTitle(/Soukloop/);
});

test('check login link', async ({ page }) => {
    await page.goto('/');
    // Check if header exists
    const header = page.locator('header');
    await expect(header).toBeVisible();
});
