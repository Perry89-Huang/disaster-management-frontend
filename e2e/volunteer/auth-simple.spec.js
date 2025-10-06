// e2e/volunteer/auth-simple.spec.js
import { test, expect } from '@playwright/test';
import {
  generateTestVolunteerAuth,
  quickRegisterVolunteer,
  quickLoginVolunteer,
  registerAndLogin,
  logoutVolunteer,
  isVolunteerLoggedIn,
  switchAuthMode,
  createMultipleTestVolunteers,
  takeScreenshot
} from '../helpers/auth-helpers.js';

/**
 * 志工認證系統 - 簡化測試（優化版）
 * 修正問題：
 * 1. ✅ 所有 page.on 改為 page.once
 * 2. ✅ 修正 strict mode violations
 * 3. ✅ 改善錯誤處理
 * 4. ✅ 增強測試資料唯一性
 * 5. ✅ 優化等待時間
 * 6. ✅ 加入更多日誌和截圖
 */

test.describe('志工認證 - 簡化測試（優化版）', () => {
  
  // 每個測試前的設置
  test.beforeEach(async ({ page }) => {
    // 清除任何殘留的 dialog handler
    page.removeAllListeners('dialog');
    
    // 前往志工頁面
    await page.goto('http://localhost:5173/volunteer');
    await page.waitForLoadState('networkidle');
  });

  // ==================== 快速註冊測試 ====================
  
  test('使用輔助函數快速註冊志工', async ({ page }) => {
    console.log('🧪 測試：快速註冊志工');
    
    // 使用輔助函數一行完成註冊
    const volunteer = await quickRegisterVolunteer(page);
    
    console.log(`  ✓ 註冊成功: ${volunteer.name}`);
    
    // 驗證自動切回登入頁面
    const loginTab = page.locator('button:has-text("志工登入")');
    await expect(loginTab).toHaveClass(/bg-white/);
    
    // 截圖
    await takeScreenshot(page, 'simple-register-success');
    
    console.log(`✅ 快速註冊測試完成: ${volunteer.name}`);
  });

  test('使用自訂資料註冊志工', async ({ page }) => {
    console.log('🧪 測試：自訂資料註冊');
    
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    
    const customData = {
      name: `自訂志工_${timestamp}`,
      phone: `0911${(timestamp + random).toString().slice(-6)}`,
      email: `custom_${timestamp}@test.com`,
      memberCount: 5
    };
    
    const volunteer = await quickRegisterVolunteer(page, customData);
    
    expect(volunteer.name).toBe(customData.name);
    expect(volunteer.phone).toBe(customData.phone);
    
    console.log(`✅ 自訂資料註冊完成: ${volunteer.name}`);
  });

  // ==================== 快速登入測試 ====================
  
  test('註冊後立即登入', async ({ page }) => {
    console.log('🧪 測試：註冊後立即登入');
    
    // 先註冊
    const volunteer = await quickRegisterVolunteer(page);
    console.log(`  ✓ 註冊完成: ${volunteer.name}`);
    
    // 再登入
    const loginSuccess = await quickLoginVolunteer(
      page, 
      volunteer.phone, 
      volunteer.name
    );
    
    expect(loginSuccess).toBe(true);
    
    // 驗證登入狀態
    const isLoggedIn = await isVolunteerLoggedIn(page);
    expect(isLoggedIn).toBe(true);
    
    // ✅ 修正：使用 .first() 避免 strict mode 錯誤
    await expect(page.locator(`text=${volunteer.name}`).first()).toBeVisible();
    
    console.log(`✅ 註冊登入流程完成`);
  });

  test('使用錯誤資料登入應該失敗', async ({ page }) => {
    console.log('🧪 測試：錯誤資料登入');
    
    // ✅ 確保從乾淨狀態開始
    await page.goto('http://localhost:5173/volunteer');
    await page.waitForLoadState('networkidle');
    
    // ✅ 如果有登入狀態，先登出
    const hasLogout = await page.locator('button:has-text("登出")').isVisible();
    if (hasLogout) {
      console.log(`  ⚠️  先登出現有狀態`);
      await page.click('button:has-text("登出")');
      await page.waitForTimeout(1000);
      await page.goto('http://localhost:5173/volunteer');
    }
    
    const loginSuccess = await quickLoginVolunteer(
      page, 
      '0999999999', 
      '不存在的志工'
    );
    
    console.log(`\n  📊 最終結果: ${loginSuccess ? '登入成功（不應該）' : '登入失敗（正確）'}`);
    
    // ✅ 驗證登入失敗
    expect(loginSuccess).toBe(false);
    
    // ✅ 額外驗證：應該還在登入頁面
    const stillOnLoginPage = await page.locator('button:has-text("志工登入")').isVisible();
    expect(stillOnLoginPage).toBe(true);
    console.log(`  ✓ 確認還在登入頁面`);
    
    console.log(`✅ 錯誤登入正確被拒絕`);
  });
  
  // ==================== 完整流程測試 ====================
  
  test('註冊並登入 - 一步完成', async ({ page }) => {
    console.log('🧪 測試：註冊並登入（一步完成）');
    
    // 使用輔助函數一步完成註冊+登入
    const volunteer = await registerAndLogin(page);
    
    // 驗證已成功登入
    const isLoggedIn = await isVolunteerLoggedIn(page);
    expect(isLoggedIn).toBe(true);
    
    // ✅ 修正：驗證志工資訊顯示（使用精確選擇器）
    await expect(
      page.locator('.text-xs.text-red-100').filter({ hasText: volunteer.name })
    ).toBeVisible();
    
    // 截圖
    await takeScreenshot(page, 'simple-register-login-complete');
    
    console.log(`✅ 完整流程一步完成: ${volunteer.name}`);
  });

  test('完整流程: 註冊 → 登入 → 登出', async ({ page }) => {
    console.log('🧪 測試：完整生命週期');
    
    // 步驟1: 註冊並登入
    const volunteer = await registerAndLogin(page);
    console.log(`  ✓ 步驟1: 註冊並登入完成`);
    
    // 步驟2: 驗證登入成功
    let isLoggedIn = await isVolunteerLoggedIn(page);
    expect(isLoggedIn).toBe(true);
    console.log(`  ✓ 步驟2: 登入狀態驗證`);
    
    // 步驟3: 登出
    const logoutSuccess = await logoutVolunteer(page);
    expect(logoutSuccess).toBe(true);
    console.log(`  ✓ 步驟3: 登出完成`);
    
    // 步驟4: 驗證已登出
    isLoggedIn = await isVolunteerLoggedIn(page);
    expect(isLoggedIn).toBe(false);
    console.log(`  ✓ 步驟4: 登出狀態驗證`);
    
    console.log(`✅ 完整生命週期測試通過`);
  });

  // ==================== Tab 切換測試 ====================
  
  test('使用輔助函數切換 Tab', async ({ page }) => {
    console.log('🧪 測試：Tab 切換');
    
    // 切換到註冊
    await switchAuthMode(page, 'register');
    await page.waitForTimeout(300);
    
    const registerTab = page.locator('button:has-text("志工註冊")');
    await expect(registerTab).toHaveClass(/bg-white/);
    console.log(`  ✓ 已切換到註冊頁面`);
    
    // 切回登入
    await switchAuthMode(page, 'login');
    await page.waitForTimeout(300);
    
    const loginTab = page.locator('button:has-text("志工登入")');
    await expect(loginTab).toHaveClass(/bg-white/);
    console.log(`  ✓ 已切回登入頁面`);
    
    console.log(`✅ Tab 切換測試完成`);
  });

  // ==================== 批次建立測試 ====================
  
  test('批次建立多位測試志工', async ({ page }) => {
    console.log('🧪 測試：批次建立志工');
    
    // 建立 3 位測試志工
    const volunteers = await createMultipleTestVolunteers(page, 3, '批次');
    
    expect(volunteers.length).toBe(3);
    console.log(`  ✓ 已建立 ${volunteers.length} 位志工`);
    
    // 驗證每位志工都能登入
    for (let i = 0; i < volunteers.length; i++) {
      const volunteer = volunteers[i];
      console.log(`  檢查志工 ${i + 1}: ${volunteer.name}`);
      
      const loginSuccess = await quickLoginVolunteer(
        page, 
        volunteer.phone, 
        volunteer.name
      );
      
      expect(loginSuccess).toBe(true);
      
      // 登出以便下一位登入
      await logoutVolunteer(page);
    }
    
    console.log(`✅ 批次建立測試完成，共 ${volunteers.length} 位志工`);
  });

  // ==================== 資料產生器測試 ====================
  
  test('測試資料產生器', async ({ page }) => {
    console.log('🧪 測試：資料產生器');
    
    // 產生 5 組不同的測試資料
    const testData = [];
    
    for (let i = 0; i < 5; i++) {
      const data = generateTestVolunteerAuth(`產生器測試_${i + 1}`);
      testData.push(data);
      console.log(`  ✓ 產生資料 ${i + 1}: ${data.phone}`);
    }
    
    // 驗證每組資料都是唯一的
    const phones = testData.map(d => d.phone);
    const uniquePhones = new Set(phones);
    
    expect(uniquePhones.size).toBe(5); // 所有手機號碼都不同
    console.log(`  ✓ 所有手機號碼都是唯一的`);
    
    // 使用產生的資料註冊（只測試前 2 個以節省時間）
    for (let i = 0; i < 2; i++) {
      const data = testData[i];
      const volunteer = await quickRegisterVolunteer(page, data);
      expect(volunteer.phone).toBe(data.phone);
      console.log(`  ✓ 註冊測試 ${i + 1}: ${volunteer.name}`);
    }
    
    console.log(`✅ 資料產生器測試完成`);
  });

  // ==================== 錯誤處理測試 ====================
  
  test('處理重複註冊', async ({ page }) => {
    console.log('🧪 測試：重複註冊處理');
    
    // 第一次註冊
    const volunteer = await quickRegisterVolunteer(page);
    console.log(`  ✓ 首次註冊: ${volunteer.name}`);
    
    // 嘗試用相同手機號碼再次註冊
    await page.goto('http://localhost:5173/volunteer');
    await switchAuthMode(page, 'register');
    
    let errorOccurred = false;
    let errorMessage = '';
    
    // ✅ 修正：使用 once 而不是 on
    page.once('dialog', async dialog => {
      errorMessage = dialog.message();
      console.log(`  📢 Alert: ${errorMessage}`);
      
      if (errorMessage.includes('失敗') || 
          errorMessage.includes('已') || 
          errorMessage.includes('重複')) {
        errorOccurred = true;
      }
      await dialog.accept();
    });
    
    // 使用相同資料註冊
    await page.fill('input[type="text"][placeholder*="姓名"]', volunteer.name);
    await page.fill('input[type="tel"]', volunteer.phone);
    await page.click('button:has-text("完成註冊")');
    await page.waitForTimeout(1500);
    
    expect(errorOccurred).toBe(true);
    console.log(`  ✓ 錯誤訊息: ${errorMessage}`);
    
    console.log(`✅ 重複註冊錯誤處理正確`);
  });

  // ==================== 響應式測試 ====================
  
  test('手機版註冊登入流程', async ({ page }) => {
    console.log('🧪 測試：手機版流程');
    
    // 設定手機版視窗
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:5173/volunteer');
    
    // 執行完整流程
    const volunteer = await registerAndLogin(page);
    
    // 驗證成功
    const isLoggedIn = await isVolunteerLoggedIn(page);
    expect(isLoggedIn).toBe(true);
    
    // ✅ 手機版驗證志工名稱（使用 first）
    await expect(page.locator(`text=${volunteer.name}`).first()).toBeVisible();
    
    // 手機版截圖
    await takeScreenshot(page, 'mobile-register-login-complete');
    
    console.log(`✅ 手機版流程測試完成`);
  });

  test('平板版註冊登入流程', async ({ page }) => {
    console.log('🧪 測試：平板版流程');
    
    // 設定平板版視窗
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:5173/volunteer');
    
    const volunteer = await registerAndLogin(page);
    
    const isLoggedIn = await isVolunteerLoggedIn(page);
    expect(isLoggedIn).toBe(true);
    
    await takeScreenshot(page, 'tablet-register-login-complete');
    
    console.log(`✅ 平板版流程測試完成`);
  });

  // ==================== 壓力測試（縮減版）====================
  
  test('連續註冊 5 位志工（快速壓力測試）', async ({ page }) => {
    console.log('🧪 測試：快速壓力測試');
    
    const startTime = Date.now();
    
    const volunteers = await createMultipleTestVolunteers(page, 5, '壓力測試');
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    expect(volunteers.length).toBe(5);
    
    console.log(`📊 壓力測試結果:`);
    console.log(`   志工數量: ${volunteers.length}`);
    console.log(`   總耗時: ${duration.toFixed(2)} 秒`);
    console.log(`   平均耗時: ${(duration / volunteers.length).toFixed(2)} 秒/人`);
    
    console.log(`✅ 快速壓力測試完成`);
  });

  // ==================== 邊界測試 ====================
  
  test('測試最大人數限制', async ({ page }) => {
    console.log('🧪 測試：人數限制');
    
    const data = generateTestVolunteerAuth('人數測試');
    data.memberCount = 100; // 設定很大的數字
    
    const volunteer = await quickRegisterVolunteer(page, data);
    
    // 驗證註冊成功
    expect(volunteer.memberCount).toBe(100);
    
    console.log(`✅ 大人數測試完成: ${volunteer.memberCount} 人`);
  });

  test('測試特殊字元處理', async ({ page }) => {
    console.log('🧪 測試：特殊字元');
    
    const timestamp = Date.now();
    const data = {
      name: `測試-志工_123!@#_${timestamp}`,
      phone: `092${(timestamp + Math.random() * 1000).toString().slice(-7)}`,
      email: `test+special_${timestamp}@example.com`,
      memberCount: 1
    };
    
    const volunteer = await quickRegisterVolunteer(page, data);
    
    expect(volunteer.name).toBe(data.name);
    
    console.log(`✅ 特殊字元測試完成`);
  });

  // ==================== 表單驗證測試 ====================
  
  test('空白必填欄位驗證', async ({ page }) => {
    console.log('🧪 測試：空白欄位驗證');
    
    await switchAuthMode(page, 'register');
    
    let alertMessage = '';
    
    // ✅ 使用 once
    page.once('dialog', async dialog => {
      alertMessage = dialog.message();
      console.log(`  📢 Alert: ${alertMessage}`);
      await dialog.accept();
    });
    
    // 不填寫任何欄位，直接提交
    await page.click('button:has-text("完成註冊")');
    await page.waitForTimeout(500);
    
    expect(alertMessage).toContain('請填寫');
    
    console.log(`✅ 空白欄位驗證正確`);
  });

  // ==================== 效能測試 ====================
  
  test('測試頁面載入速度', async ({ page }) => {
    console.log('🧪 測試：頁面載入速度');
    
    const startTime = Date.now();
    
    await page.goto('http://localhost:5173/volunteer');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    console.log(`  ⏱️  頁面載入時間: ${loadTime}ms`);
    
    // 驗證載入時間在可接受範圍內
    expect(loadTime).toBeLessThan(3000); // 3秒內
    
    console.log(`✅ 頁面載入速度測試通過`);
  });

  test('測試註冊響應速度', async ({ page }) => {
    console.log('🧪 測試：註冊響應速度');
    
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    
    await switchAuthMode(page, 'register');
    
    await page.fill('input[type="text"][placeholder*="姓名"]', `速度測試_${timestamp}`);
    await page.fill('input[type="tel"]', `092${(timestamp + random).toString().slice(-7)}`);
    
    // ✅ 使用 once
    page.once('dialog', async dialog => await dialog.accept());
    
    const startTime = Date.now();
    await page.click('button:has-text("完成註冊")');
    await page.waitForTimeout(1500);
    const responseTime = Date.now() - startTime;
    
    console.log(`  ⏱️  註冊響應時間: ${responseTime}ms`);
    
    expect(responseTime).toBeLessThan(3000); // 3秒內
    
    console.log(`✅ 註冊響應速度測試通過`);
  });
});

// ==================== 測試報告 ====================

test.afterAll(async () => {
  console.log('\n' + '='.repeat(70));
  console.log('📊 志工認證簡化測試完成報告（優化版）');
  console.log('='.repeat(70));
  console.log('\n✅ 優化項目：');
  console.log('   1. ✅ 所有 page.on 改為 page.once（避免重複處理）');
  console.log('   2. ✅ 修正 strict mode violations（使用 .first()）');
  console.log('   3. ✅ 改善錯誤處理（更詳細的錯誤訊息）');
  console.log('   4. ✅ 增強測試資料唯一性（時間戳記 + 隨機數）');
  console.log('   5. ✅ 優化等待時間（移除不必要的延遲）');
  console.log('   6. ✅ 加入 beforeEach 清理（避免狀態污染）');
  console.log('   7. ✅ 改善日誌輸出（更清晰的測試進度）');
  console.log('   8. ✅ 新增效能測試（頁面載入、響應速度）');
  console.log('\n💡 測試涵蓋：');
  console.log('   - 快速註冊與登入（使用輔助函數）');
  console.log('   - 完整流程（註冊 → 登入 → 登出）');
  console.log('   - Tab 切換');
  console.log('   - 批次建立志工');
  console.log('   - 資料產生器');
  console.log('   - 錯誤處理（重複註冊）');
  console.log('   - 響應式設計（手機、平板）');
  console.log('   - 壓力測試（快速版）');
  console.log('   - 邊界測試（人數、特殊字元）');
  console.log('   - 表單驗證');
  console.log('   - 效能測試');
  console.log('\n📸 截圖位置: test-results/screenshots/');
  console.log('='.repeat(70) + '\n');
});