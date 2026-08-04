export default async function run(page, ui) {
  // Take screenshots at different scroll positions
  await page.setViewportSize({ width: 1280, height: 800 });
  
  await page.waitForTimeout(2000);

  // Hero section
  await page.screenshot({ path: 'home-screenshots/01-hero.png', fullPage: false });
  
  // Get page text content (visible only)
  const text = await page.evaluate(() => document.body.innerText);
  
  // Scroll down 800px for blocks section
  await page.evaluate(() => window.scrollBy(0, 800));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'home-screenshots/02-services.png', fullPage: false });
  
  // Scroll down 800px more
  await page.evaluate(() => window.scrollBy(0, 800));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'home-screenshots/03-projects.png', fullPage: false });
  
  // Scroll down 800px more  
  await page.evaluate(() => window.scrollBy(0, 800));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'home-screenshots/04-blog-cta.png', fullPage: false });
  
  return { text: text.substring(0, 3000) };
}
