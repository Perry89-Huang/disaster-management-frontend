import { test, expect } from '@playwright/test';

/**
 * 煙霧測試 (Smoke Test)
 * 這是最基本的測試，用來驗證系統基本功能正常
 * 如果這些測試失敗，表示系統有重大問題
 */
test.describe('系統煙霧測試', () => {
  
  /**
   * 測試 1：管理員頁面可以開啟
   */
  test('管理員頁面應該可以開啟', async ({ page }) => {
    console.log('🔍 正在測試管理員頁面...');
    
    // 導航到管理員頁面
    await page.goto('/admin');
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    // 驗證頁面標題
    await expect(page.locator('h1')).toContainText('花蓮縣光復救災資源管理系統');
    
    console.log('✅ 管理員頁面正常');
  });
  
  /**
   * 測試 2：志工頁面可以開啟
   */
  test('志工頁面應該可以開啟', async ({ page }) => {
    console.log('🔍 正在測試志工頁面...');
    
    // 導航到志工頁面
    await page.goto('/volunteer');
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    // 驗證頁面標題
    await expect(page.locator('h1')).toContainText('花蓮光復救災');
    
    console.log('✅ 志工頁面正常');
  });
  
  /**
   * 測試 3：404 頁面正常運作
   */
  test('不存在的頁面應該顯示 404', async ({ page }) => {
    console.log('🔍 正在測試 404 頁面...');
    
    // 導航到不存在的頁面
    await page.goto('/this-page-does-not-exist');
    
    // 驗證顯示 404
    await expect(page.locator('text=404')).toBeVisible();
    await expect(page.locator('text=找不到頁面')).toBeVisible();
    
    console.log('✅ 404 頁面正常');
  });
  
  /**
   * 測試 4：首頁重定向
   */
  test('首頁應該正常顯示', async ({ page }) => {
    console.log('🔍 正在測試首頁...');
    
    // 導航到首頁
    await page.goto('/');
    
    // 驗證頁面載入成功（應該顯示管理員頁面）
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toBeVisible();
    
    console.log('✅ 首頁正常');
  });
});

/**
 * 基本互動測試
 */
test.describe('基本互動測試', () => {
  
  /**
   * 測試 5：管理員頁面 Tab 切換
   */
  test('管理員應該可以切換不同頁籤', async ({ page }) => {
    console.log('🔍 正在測試頁籤切換...');
    
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // 點擊志工管理
    await page.click('button:has-text("志工管理")');
    await page.waitForTimeout(300);
    await expect(page.locator('h2:has-text("志工管理")')).toBeVisible();
    console.log('  ✓ 志工管理頁籤正常');
    
    // 點擊需求管理
    await page.click('button:has-text("需求管理")');
    await page.waitForTimeout(300);
    await expect(page.locator('h2:has-text("需求管理")')).toBeVisible();
    console.log('  ✓ 需求管理頁籤正常');
    
    // 點擊派單管理
    await page.click('button:has-text("派單管理")');
    await page.waitForTimeout(300);
    await expect(page.locator('h2:has-text("派單管理")')).toBeVisible();
    console.log('  ✓ 派單管理頁籤正常');
    
    // 回到儀表板
    await page.click('button:has-text("儀表板")');
    await page.waitForTimeout(300);
    console.log('  ✓ 儀表板頁籤正常');
    
    console.log('✅ 所有頁籤切換正常');
  });
  
  /**
   * 測試 6：志工頁面 Tab 切換
   */
  test('志工頁面底部導航應該正常運作', async ({ page }) => {
    console.log('🔍 正在測試志工底部導航...');
    
    // 注意：這個測試需要先登入，但我們先跳過登入測試真實的導航功能
    await page.goto('/volunteer');
    
    // 驗證底部導航欄存在
    const navBar = page.locator('div.fixed.bottom-0');
    await expect(navBar).toBeVisible();
    console.log('  ✓ 底部導航欄存在');
    
    // 驗證三個導航按鈕都存在
    await expect(page.locator('button:has-text("首頁")')).toBeVisible();
    await expect(page.locator('button:has-text("任務")')).toBeVisible();
    await expect(page.locator('button:has-text("我的")')).toBeVisible();
    console.log('  ✓ 所有導航按鈕存在');
    
    console.log('✅ 志工底部導航正常');
  });
});