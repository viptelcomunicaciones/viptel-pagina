import { test, expect } from '@playwright/test';

test.describe('Website E2E Verifications', () => {
  const previewSecret = '01798635fc2b4dae';

  test('1. Spanish /example: Header rendered with variant and shape, Scroll Progress works', async ({ page }) => {
    await page.goto('http://localhost:4321/example', { waitUntil: 'networkidle' });

    // Header exists
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Verify shape
    const shape = await header.getAttribute('data-header-shape');
    expect(['bar', 'floating']).toContain(shape);

    // Verify variant is not null/empty
    const variant = await header.getAttribute('data-header-variant');
    expect(variant).toBeTruthy();

    // Verify Cookie Consent Banner is present and visible
    const consentBanner = page.locator('#consent-banner');
    await expect(consentBanner).toBeVisible();

    // Verify Privacy Policy link inside the banner points to /privacy
    const privacyLink = consentBanner.locator('a[href="/privacy"]');
    await expect(privacyLink).toBeVisible();

    // Verify Scroll Progress Bar operates
    const progressBar = page.locator('#scroll-progress-bar');
    await expect(progressBar).toBeAttached();

    // Scroll down to middle of page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(400);

    // Verify progress width increased
    const widthStyle = await progressBar.evaluate((el) => (el as HTMLElement).style.width);
    const pct = parseFloat(widthStyle || '0');
    expect(pct).toBeGreaterThan(10);
  });

  test('2. English /en/example: Header rendered, localized Cookie Consent Banner and Progress Bar', async ({ page }) => {
    await page.goto('http://localhost:4321/en/example', { waitUntil: 'networkidle' });

    // Header exists
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Verify Cookie Consent Banner is present and visible
    const consentBanner = page.locator('#consent-banner');
    await expect(consentBanner).toBeVisible();

    // Localized Privacy Policy link points to /en/privacy
    const privacyLink = consentBanner.locator('a[href="/en/privacy"]');
    await expect(privacyLink).toBeVisible();

    // Verify Scroll Progress Bar operates in English
    const progressBar = page.locator('#scroll-progress-bar');
    await expect(progressBar).toBeAttached();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(400);

    const widthStyle = await progressBar.evaluate((el) => (el as HTMLElement).style.width);
    const pct = parseFloat(widthStyle || '0');
    expect(pct).toBeGreaterThan(10);
  });

  test('3. Dynamic variant switching: Changing floatingVariant in Payload reflects on /example and /en/example', async ({ page, request }) => {
    // Authenticate as Admin via Payload API
    const loginRes = await request.post('http://localhost:3000/api/users/login', {
      data: {
        email: 'viptelcomunicaciones@hotmail.com',
        password: 'Viptel3562/*-',
      },
    });
    expect(loginRes.ok()).toBeTruthy();
    const { token } = await loginRes.json();
    expect(token).toBeTruthy();

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
    };

    try {
      // 1. Switch doc 16 to floating + solid
      const patch1 = await request.patch('http://localhost:3000/api/pages/16', {
        headers: authHeaders,
        data: { headerStyle: 'floating', floatingVariant: 'solid' },
      });
      expect(patch1.ok()).toBeTruthy();

      // Trigger revalidation
      const reval1 = await request.post('http://localhost:4321/api/revalidate', {
        headers: {
          'Content-Type': 'application/json',
          'x-revalidate-secret': previewSecret,
        },
        data: { paths: ['/example', '/en/example'], collection: 'pages' },
      });
      expect(reval1.ok()).toBeTruthy();

      // Verify /example reflects floating + solid
      await page.goto('http://localhost:4321/example', { waitUntil: 'networkidle' });
      const headerSolid = page.locator('header');
      await expect(headerSolid).toHaveAttribute('data-header-shape', 'floating');
      await expect(headerSolid).toHaveAttribute('data-header-variant', 'solid');

      // Verify /en/example also reflects floating + solid
      await page.goto('http://localhost:4321/en/example', { waitUntil: 'networkidle' });
      const enHeaderSolid = page.locator('header');
      await expect(enHeaderSolid).toHaveAttribute('data-header-shape', 'floating');
      await expect(enHeaderSolid).toHaveAttribute('data-header-variant', 'solid');

      // 2. Switch doc 16 to floating + transparent
      const patch2 = await request.patch('http://localhost:3000/api/pages/16', {
        headers: authHeaders,
        data: { headerStyle: 'floating', floatingVariant: 'transparent' },
      });
      expect(patch2.ok()).toBeTruthy();

      await request.post('http://localhost:4321/api/revalidate', {
        headers: {
          'Content-Type': 'application/json',
          'x-revalidate-secret': previewSecret,
        },
        data: { paths: ['/example', '/en/example'], collection: 'pages' },
      });

      await page.goto('http://localhost:4321/example', { waitUntil: 'networkidle' });
      const headerTrans = page.locator('header');
      await expect(headerTrans).toHaveAttribute('data-header-shape', 'floating');
      await expect(headerTrans).toHaveAttribute('data-header-variant', 'transparent');
    } finally {
      // 3. Always reset doc 16 back to bar + default
      await request.patch('http://localhost:3000/api/pages/16', {
        headers: authHeaders,
        data: { headerStyle: 'bar', floatingVariant: 'default' },
      });
      await request.post('http://localhost:4321/api/revalidate', {
        headers: {
          'Content-Type': 'application/json',
          'x-revalidate-secret': previewSecret,
        },
        data: { paths: ['/example', '/en/example'], collection: 'pages' },
      });
    }
  });

  test('4. Cookie Banner interaction: Accept All dismisses banner and persists in localStorage', async ({ page }) => {
    await page.goto('http://localhost:4321/example', { waitUntil: 'networkidle' });

    const consentBanner = page.locator('#consent-banner');
    await expect(consentBanner).toBeVisible();

    const acceptBtn = page.locator('#consent-accept-all');
    await expect(acceptBtn).toBeVisible();
    await acceptBtn.click();

    // Banner should hide
    await expect(consentBanner).not.toBeVisible();

    // LocalStorage should have cookie-consent
    const stored = await page.evaluate(() => localStorage.getItem('cookie-consent'));
    expect(stored).toBeTruthy();
    expect(stored).toContain('"analytics":true');
  });

  test('5. Contact page: Renders SiteSettings contact info (Email, Phone, Address)', async ({ page }) => {
    await page.goto('http://localhost:4321/contact', { waitUntil: 'networkidle' });

    // Email link in contact card
    const emailLink = page.locator('#main-content a[href^="mailto:"]');
    await expect(emailLink).toBeVisible();

    // Phone link in contact card
    const phoneLink = page.locator('#main-content a[href^="tel:"]');
    await expect(phoneLink).toBeVisible();

    // Footer exists and has branding
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});
