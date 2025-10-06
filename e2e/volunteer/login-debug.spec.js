// e2e/volunteer/login-debug.spec.js
import { test, expect } from '@playwright/test';

/**
 * 簡化版登入流程測試 - 用於除錯
 */

test.describe('登入流程除錯測試', () => {
  
  // ========== 測試 1: 檢查頁面載入 ==========
  test('1. 檢查志工頁面是否正常載入', async ({ page }) => {
    console.log('📍 測試 1: 檢查頁面載入');
    
    await page.goto('http://localhost:5173/volunteer');
    await page.waitForLoadState('networkidle');
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/screenshots/step1-page-loaded.png',
      fullPage: true 
    });
    
    // 驗證關鍵元素
    await expect(page.locator('text=花蓮光復救災')).toBeVisible();
    await expect(page.locator('button:has-text("志工登入")')).toBeVisible();
    
    console.log('✅ 頁面載入正常');
  });

  // ========== 測試 2: 先註冊後登入（完整流程）==========
  test('2. 註冊 → 登入完整流程', async ({ page }) => {
    console.log('📍 測試 2: 註冊 → 登入流程');
    
    const timestamp = Date.now();
    const testData = {
      name: `除錯測試_${timestamp}`,
      phone: `0920${timestamp.toString().slice(-6)}`
    };
    
    console.log(`測試資料: ${testData.name} (${testData.phone})`);
    
    // --- 步驟 2.1: 前往註冊頁面 ---
    await page.goto('http://localhost:5173/volunteer');
    await page.click('button:has-text("志工註冊")');
    await page.waitForTimeout(300);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/step2-1-register-page.png' 
    });
    
    console.log('  ✓ 已進入註冊頁面');
    
    // --- 步驟 2.2: 填寫註冊表單 ---
    await page.fill('input[type="text"][placeholder*="姓名"]', testData.name);
    await page.fill('input[type="tel"]', testData.phone);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/step2-2-register-filled.png' 
    });
    
    console.log('  ✓ 表單已填寫');
    
    // --- 步驟 2.3: 提交註冊 ---
    let registerMessage = '';
    page.once('dialog', async dialog => {
      registerMessage = dialog.message();
      console.log(`  📢 註冊訊息: ${registerMessage}`);
      await dialog.accept();
    });
    
    await page.click('button:has-text("完成註冊")');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/step2-3-after-register.png' 
    });
    
    console.log(`  ✓ 註冊完成: ${registerMessage}`);
    
    // --- 步驟 2.4: 填寫登入表單 ---
    // 檢查是否自動回到登入頁面
    const isLoginPage = await page.locator('button:has-text("志工登入")').isVisible();
    console.log(`  ℹ️  是否在登入頁面: ${isLoginPage}`);
    
    if (!isLoginPage) {
      await page.click('button:has-text("志工登入")');
      await page.waitForTimeout(300);
    }
    
    // 清空並重新填寫
    await page.fill('input[type="tel"]', '');
    await page.fill('input[type="text"][placeholder*="姓名"]', '');
    
    await page.fill('input[type="tel"]', testData.phone);
    await page.fill('input[type="text"][placeholder*="姓名"]', testData.name);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/step2-4-login-filled.png' 
    });
    
    console.log('  ✓ 登入表單已填寫');
    
    // --- 步驟 2.5: 點擊登入 ---
    let loginMessage = '';
    page.once('dialog', async dialog => {
      loginMessage = dialog.message();
      console.log(`  📢 登入訊息: ${loginMessage}`);
      await dialog.accept();
    });
    
    // 使用精確的按鈕選擇器
    const loginButton = page.locator('button').filter({ hasText: /^登入$/ }).first();
    await loginButton.click();
    
    console.log('  ✓ 已點擊登入按鈕');
    
    // --- 步驟 2.6: 等待並檢查結果 ---
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/step2-5-after-login.png',
      fullPage: true 
    });
    
    // 檢查目前在哪個頁面
    const hasLoginTab = await page.locator('button:has-text("志工登入")').isVisible();
    const hasMainPage = await page.locator('text=光復救災志工').isVisible();
    const hasVolunteerName = await page.getByText(testData.name, { exact: true }).first().isVisible();
    
    console.log('\n📊 登入後狀態檢查:');
    console.log(`  - 還在登入頁面: ${hasLoginTab}`);
    console.log(`  - 已進入主頁面: ${hasMainPage}`);
    console.log(`  - 顯示志工名稱: ${hasVolunteerName}`);
    console.log(`  - 登入訊息: ${loginMessage}\n`);
    
    // 驗證
    if (hasMainPage) {
      console.log('✅ 登入成功！已進入主頁面');
      await expect(page.locator('text=光復救災志工')).toBeVisible();
    } else {
      console.error('❌ 登入失敗！仍在登入頁面');
      throw new Error(`登入失敗。訊息: ${loginMessage}`);
    }
  });

  // ========== 測試 3: 使用已存在的志工登入 ==========
  test('3. 使用已存在志工登入（需手動建立）', async ({ page }) => {
    console.log('📍 測試 3: 使用已存在志工');
    
    // 這裡使用您已經在資料庫中建立的測試志工
    const existingVolunteer = {
      name: '測試志工',  // 改成您的測試志工名稱
      phone: '0912345678'  // 改成您的測試志工手機
    };
    
    await page.goto('http://localhost:5173/volunteer');
    
    await page.fill('input[type="tel"]', existingVolunteer.phone);
    await page.fill('input[type="text"][placeholder*="姓名"]', existingVolunteer.name);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/step3-existing-filled.png' 
    });
    
    page.once('dialog', async dialog => {
      console.log(`  📢 ${dialog.message()}`);
      await dialog.accept();
    });
    
    const loginButton = page.locator('button').filter({ hasText: /^登入$/ }).first();
    await loginButton.click();
    
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/step3-result.png',
      fullPage: true 
    });
    
    const isMainPage = await page.locator('text=光復救災志工').isVisible();
    console.log(`登入結果: ${isMainPage ? '成功' : '失敗'}`);
  });

  // ========== 測試 4: 檢查 GraphQL 請求 ==========
  test('4. 監聽登入時的 GraphQL 請求', async ({ page }) => {
    console.log('📍 測試 4: 監聽 GraphQL 請求');
    
    const timestamp = Date.now();
    const testData = {
      name: `API測試_${timestamp}`,
      phone: `0921${timestamp.toString().slice(-6)}`
    };
    
    // 監聽所有 GraphQL 請求
    page.on('request', request => {
      if (request.url().includes('graphql')) {
        console.log('📤 GraphQL 請求:', request.postData());
      }
    });
    
    page.on('response', async response => {
      if (response.url().includes('graphql')) {
        const body = await response.text().catch(() => 'Cannot read body');
        console.log('📥 GraphQL 回應:', body.substring(0, 200));
      }
    });
    
    // 先註冊
    await page.goto('http://localhost:5173/volunteer');
    await page.click('button:has-text("志工註冊")');
    await page.fill('input[type="text"][placeholder*="姓名"]', testData.name);
    await page.fill('input[type="tel"]', testData.phone);
    
    page.once('dialog', async dialog => await dialog.accept());
    await page.click('button:has-text("完成註冊")');
    await page.waitForTimeout(2000);
    
    // 登入
    await page.fill('input[type="tel"]', testData.phone);
    await page.fill('input[type="text"][placeholder*="姓名"]', testData.name);
    
    page.once('dialog', async dialog => await dialog.accept());
    
    const loginButton = page.locator('button').filter({ hasText: /^登入$/ }).first();
    await loginButton.click();
    
    await page.waitForTimeout(3000);
    
    console.log('✅ API 請求測試完成（查看上方日誌）');
  });
});

// 測試後報告
test.afterAll(async () => {
  console.log('\n' + '='.repeat(60));
  console.log('📊 除錯測試完成');
  console.log('='.repeat(60));
  console.log('📸 截圖位置: test-results/screenshots/');
  console.log('   - step1-page-loaded.png     - 頁面載入');
  console.log('   - step2-1-register-page.png - 註冊頁面');
  console.log('   - step2-2-register-filled.png - 註冊表單');
  console.log('   - step2-3-after-register.png - 註冊後');
  console.log('   - step2-4-login-filled.png - 登入表單');
  console.log('   - step2-5-after-login.png - 登入後');
  console.log('='.repeat(60) + '\n');
});