import { test, expect } from '@playwright/test';

// Define user credentials (mock or seed data required usually, but we'll use robust selectors)
const TEST_USER = {
    email: 'testuser@example.com',
    password: 'Password123!',
};

test.describe('🛡️ Auth Torture Tests', () => {

    // 1. Adversarial: Injection Attacks
    test('Security: Should reject SQL Injection in Email', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        // Open Login Modal with correct selector
        await page.getByRole('button', { name: 'Log in / Sign up' }).click();

        // SELECT "Log In" from the Choice Screen (AuthPopup)
        // The button has text "Log In" and class includes 'bg-[#e0622c]'
        await page.getByRole('button', { name: 'Log In', exact: true }).click();

        // Now we can fill the form
        await page.getByPlaceholder('Enter Your Email').fill("' OR '1'='1");
        // Some forms might validate email format client-side, so this might fail validation before submission
        // We check if it lets us submit or shows validation error instantly
        await page.getByPlaceholder('Password').fill('randompass');

        // Submit (Inside LoginPopup)
        const submitBtn = page.getByRole('button', { name: 'Sign In' });
        await submitBtn.click();

        // Expect Error Message or HTML5 validation
        // If client side validation prevents it, that's also a pass for "rejecting" it
        await expect(page.getByText(/Invalid email|Please include an '@'/i).first()).toBeVisible();
    });

    test('Security: Should reject XSS Payload in Inputs', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await page.getByRole('button', { name: 'Log in / Sign up' }).click();

        // Select Log In choice
        await page.getByRole('button', { name: 'Log In', exact: true }).click();

        const xssPayload = "<script>alert('XSS')</script>";
        await page.getByPlaceholder('Enter Your Email').fill(xssPayload);
        await page.getByPlaceholder('Password').fill('password');
        await page.getByRole('button', { name: 'Sign In' }).click();

        // Expect Validation Error or graceful failure
        await expect(page.getByText(/Invalid email|Please include an '@'/i).first()).toBeVisible();
    });

    // 2. Privilege Escalation
    test('Security: Unauthenticated User cannot access Admin Dashboard', async ({ page }) => {
        await page.goto('/admin');

        // Should be redirected to login or show 403/404
        // We expect the URL to change OR the page to show a login form/unauthorized message
        // Note: If /admin redirects to /signin, expect that.
        await expect(page).toHaveURL(/signin|login/);
    });

    // 3. Network Chaos: Offline Handling
    test('Stability: Should handle Offline Mode gracefully', async ({ page, context }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await page.getByRole('button', { name: 'Log in / Sign up' }).click();

        // Select Log In choice
        await page.getByRole('button', { name: 'Log In', exact: true }).click();

        await page.getByPlaceholder('Enter Your Email').fill(TEST_USER.email);
        await page.getByPlaceholder('Password').fill(TEST_USER.password);

        // Simulate Offline
        await context.setOffline(true);

        await page.getByRole('button', { name: 'Sign In' }).click();

        // Expect generic network error message handled by UI (AlertCircle in LoginPopup)
        // The exact text depends on fetch failure message in browser ("Network request failed" usually)
        // We will check if the error alert appears
        const errorAlert = page.locator('.bg-red-50'); // Based on LoginPopup class
        await expect(errorAlert).toBeVisible();
    });

    // 4. Race Condition: Double Submit
    test('Stability: Double-Click Login should not crash', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await page.getByRole('button', { name: 'Log in / Sign up' }).click();

        // Select Log In choice
        await page.getByRole('button', { name: 'Log In', exact: true }).click();

        await page.getByPlaceholder('Enter Your Email').fill(TEST_USER.email);
        await page.getByPlaceholder('Password').fill(TEST_USER.password);

        // Rapid Double Click
        const submitBtn = page.getByRole('button', { name: 'Sign In' });

        // Click once
        await submitBtn.click();

        // Attempt second click immediately (Playwright might inhibit this element is disabled, which is GOOD)
        // We want to verify the button becomes disabled
        await expect(submitBtn).toBeDisabled({ timeout: 1000 });
    });

});
