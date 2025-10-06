import { test, expect } from '@playwright/test';

test('志工可以查看登入頁面', async ({ page }) => {
  // 導航到您的 App
  await page.goto('/volunteer');
  
  // 驗證頁面標題
  await expect(page.locator('h1')).toContainText('花蓮光復救災');
  
  // 驗證登入按鈕存在
  await expect(page.locator('button:has-text("志工登入")')).toBeVisible();
  
  // 截圖
  await page.screenshot({ path: 'test-results/volunteer-login.png' });
});
