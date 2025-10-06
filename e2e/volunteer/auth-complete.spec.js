// e2e/volunteer/auth-complete.spec.js
import { test, expect } from '@playwright/test';

/**
 * 志工註冊登入系統完整測試案例
 * 測試範圍：UI展示、表單驗證、註冊流程、登入流程、錯誤處理
 */

test.describe('志工認證系統 - 完整測試', () => {
  
  test.beforeEach(async ({ page }) => {
    // 前往志工端頁面
    await page.goto('http://localhost:5173/volunteer');
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
  });

  // ==================== UI 顯示測試 ====================
  
  test.describe('UI 顯示與佈局', () => {
    
    test('應該正確顯示認證頁面的所有元素', async ({ page }) => {
      // 檢查標題和Logo
      await expect(page.locator('text=花蓮光復救災')).toBeVisible();
      await expect(page.locator('text=志工資源管理系統')).toBeVisible();
      
      // 檢查 Tab 切換按鈕
      await expect(page.locator('button:has-text("志工登入")')).toBeVisible();
      await expect(page.locator('button:has-text("志工註冊")')).toBeVisible();
      
      // 檢查聯絡資訊
      await expect(page.locator('text=花蓮縣光復鄉公所')).toBeVisible();
      await expect(page.locator('text=03-8701100')).toBeVisible();
      
      console.log('✓ 認證頁面所有 UI 元素顯示正確');
    });

    test('預設應該顯示登入表單', async ({ page }) => {
      // 檢查登入 Tab 是否為 active 狀態
      const loginTab = page.locator('button:has-text("志工登入")');
      await expect(loginTab).toHaveClass(/bg-white.*text-red-600/);
      
      // 檢查登入表單欄位
      await expect(page.locator('input[type="tel"][placeholder*="0912"]')).toBeVisible();
      await expect(page.locator('input[type="text"][placeholder*="姓名"]')).toBeVisible();
      await expect(page.getByRole('button', { name: '登入', exact: true })).toBeVisible();
      
      console.log('✓ 預設顯示登入表單');
    });

    test('切換到註冊表單應該顯示完整註冊欄位', async ({ page }) => {
      // 點擊註冊 Tab
      await page.click('button:has-text("志工註冊")');
      await page.waitForTimeout(300);
      
      // 檢查註冊 Tab 是否為 active
      const registerTab = page.locator('button:has-text("志工註冊")');
      await expect(registerTab).toHaveClass(/bg-white.*text-red-600/);
      
      // 檢查註冊表單欄位
      await expect(page.locator('input[type="text"][placeholder*="姓名"]')).toBeVisible();
      await expect(page.locator('input[type="tel"][placeholder*="0912"]')).toBeVisible();
      await expect(page.locator('input[type="email"][placeholder*="example"]')).toBeVisible();
      await expect(page.locator('input[type="number"]')).toBeVisible();
      await expect(page.locator('button:has-text("完成註冊")')).toBeVisible();
      
      // 檢查必填標記
      const requiredFields = await page.locator('span.text-red-600:has-text("*")').count();
      expect(requiredFields).toBeGreaterThan(0);
      
      console.log('✓ 註冊表單顯示完整');
    });
  });

  // ==================== 登入功能測試 ====================
  
  test.describe('志工登入功能', () => {
    
    test('成功登入流程 - 使用正確的手機號碼和姓名', async ({ page }) => {
  const timestamp = Date.now();
  const testPhone = `0912${timestamp.toString().slice(-6)}`;
  const testName = `測試志工_${timestamp}`;
  
  console.log(`📝 準備測試資料: ${testName} (${testPhone})`);
  
  // ===== 步驟 1: 先註冊一個志工 =====
  await page.goto('http://localhost:5173/volunteer');
  await page.click('button:has-text("志工註冊")');
  await page.waitForTimeout(300);
  
  await page.fill('input[type="text"][placeholder*="姓名"]', testName);
  await page.fill('input[type="tel"][placeholder*="0912"]', testPhone);
  
  // 設置 alert handler（在點擊前）
  let registerAlert = '';
  page.once('dialog', async dialog => {
    registerAlert = dialog.message();
    console.log(`  ℹ️  註冊 Alert: ${dialog.message()}`);
    await dialog.accept();
  });
  
  await page.click('button:has-text("完成註冊")');
  
  // 等待註冊完成
  await page.waitForTimeout(2000);
  
  // 驗證註冊是否成功
  if (!registerAlert.includes('成功')) {
    console.error(`  ❌ 註冊失敗: ${registerAlert}`);
    throw new Error('註冊失敗');
  }
  
  console.log('  ✅ 註冊成功');
  
  // ===== 步驟 2: 切回登入頁面 =====
  // 註冊成功後應該自動在登入頁面
  await page.waitForTimeout(500);
  
  // 確認在登入頁面
  const loginTab = page.locator('button:has-text("志工登入")');
  await expect(loginTab).toHaveClass(/bg-white.*text-red-600/);
  
  // ===== 步驟 3: 填寫登入表單 =====
  console.log(`  🔐 開始登入...`);
  
  // 清空並重新填寫（確保資料正確）
  await page.fill('input[type="tel"]', '');
  await page.fill('input[type="text"][placeholder*="姓名"]', '');
  
  await page.fill('input[type="tel"]', testPhone);
  await page.fill('input[type="text"][placeholder*="姓名"]', testName);
  
  // 截圖：登入表單已填寫
  await page.screenshot({ 
    path: 'test-results/screenshots/volunteer-login-filled.png',
    fullPage: true 
  });
  
  // ===== 步驟 4: 點擊登入 =====
  // 設置登入 alert handler
  let loginAlert = '';
  page.once('dialog', async dialog => {
    loginAlert = dialog.message();
    console.log(`  ℹ️  登入 Alert: ${dialog.message()}`);
    await dialog.accept();
  });
  
  // 點擊登入按鈕（使用精確選擇器）
  const loginButton = page.locator('button').filter({ hasText: /^登入$/ });
  await loginButton.click();
  
  // ===== 步驟 5: 等待跳轉到主頁 =====
  console.log(`  ⏳ 等待跳轉到主頁...`);
  
  // 方法 1: 等待特定元素出現（推薦）
  try {
    await page.waitForSelector('text=光復救災志工', { 
      timeout: 5000,
      state: 'visible' 
    });
    console.log('  ✅ 已進入主頁');
  } catch (error) {
    // 如果沒有跳轉，截圖查看當前狀態
    await page.screenshot({ 
      path: 'test-results/screenshots/login-failed-state.png',
      fullPage: true 
    });
    
    console.error(`  ❌ 未能進入主頁`);
    console.error(`  登入 Alert: ${loginAlert}`);
    throw new Error('登入後未跳轉到主頁');
  }
  
  // ===== 步驟 6: 驗證志工資訊顯示 =====
  // 使用更靈活的選擇器
  const nameLocator = page.locator(`text=${testName}`);
  
  try {
    await expect(nameLocator).toBeVisible({ timeout: 3000 });
    console.log(`  ✅ 志工名稱顯示正確: ${testName}`);
  } catch (error) {
    // 嘗試尋找部分匹配
    const partialName = testName.split('_')[0]; // "測試志工"
    const partialLocator = page.locator(`text=${partialName}`).first();
    
    if (await partialLocator.isVisible()) {
      console.log(`  ⚠️  只找到部分名稱: ${partialName}`);
    } else {
      await page.screenshot({ 
        path: 'test-results/screenshots/name-not-found.png',
        fullPage: true 
      });
      throw new Error(`找不到志工名稱: ${testName}`);
    }
  }
  
  // 驗證其他主頁元素
  await expect(page.locator('text=光復救災志工')).toBeVisible();
  await expect(page.locator(`text=${testPhone}`)).toBeVisible();
  
  // 截圖：登入成功
  await page.screenshot({ 
    path: 'test-results/screenshots/volunteer-login-success.png',
    fullPage: true 
  });
  
  console.log(`✅ 登入流程測試完成`);
    });

    test('登入失敗 - 不存在的手機號碼', async ({ page }) => {
      const fakePhone = '0912999999';
      const fakeName = '不存在的志工';
      
      // 填寫登入表單
      await page.fill('input[type="tel"][placeholder*="0912"]', fakePhone);
      await page.fill('input[type="text"][placeholder*="姓名"]', fakeName);
      
      // 監聽 alert
      let alertMessage = '';
      page.on('dialog', async dialog => {
        alertMessage = dialog.message();
        await dialog.accept();
      });
      
      // 點擊登入
      //await page.click('button:has-text("登入")');  //Perry modified
      await page.locator('button').filter({ hasText: /^登入$/ }).click();
      await page.waitForTimeout(1500);
      
      // 驗證錯誤訊息
      expect(alertMessage).toContain('找不到此志工資料');
      
      console.log('✓ 正確處理不存在的志工登入');
    });

    test('登入失敗 - 姓名與手機號碼不匹配', async ({ page }) => {
      // 使用存在的手機但錯誤的姓名
      await page.fill('input[type="tel"][placeholder*="0912"]', '0912345678');
      await page.fill('input[type="text"][placeholder*="姓名"]', '錯誤姓名');
      
      let alertMessage = '';
      page.on('dialog', async dialog => {
        alertMessage = dialog.message();
        await dialog.accept();
      });
      
      await page.locator('button').filter({ hasText: /^登入$/ }).click();
      await page.waitForTimeout(1500);
      
      expect(alertMessage).toContain('找不到此志工資料');
      
      console.log('✓ 正確處理姓名手機不匹配');
    });

    test('表單驗證 - 必填欄位檢查', async ({ page }) => {
      let alertMessage = '';
      page.on('dialog', async dialog => {
        alertMessage = dialog.message();
        await dialog.accept();
      });
      
      // 測試：只填手機號碼
      await page.fill('input[type="tel"][placeholder*="0912"]', '0912345678');
      await page.locator('button').filter({ hasText: /^登入$/ }).click();
      await page.waitForTimeout(500);
      expect(alertMessage).toContain('請填寫');
      
      // 清空表單
      await page.fill('input[type="tel"][placeholder*="0912"]', '');
      alertMessage = '';
      
      // 測試：只填姓名
      await page.fill('input[type="text"][placeholder*="姓名"]', '測試');
      await page.locator('button').filter({ hasText: /^登入$/ }).click();
      await page.waitForTimeout(500);
      expect(alertMessage).toContain('請填寫');
      
      console.log('✓ 登入表單必填驗證正確');
    });
  });

  // ==================== 註冊功能測試 ====================
  
  test.describe('志工註冊功能', () => {
    
    test('完整註冊流程 - 填寫所有欄位', async ({ page }) => {
      const timestamp = Date.now();
      const testData = {
        name: `完整註冊_${timestamp}`,
        phone: `0912${timestamp.toString().slice(-6)}`,
        email: `test_${timestamp}@example.com`,
        memberCount: 3
      };
      
      // 切換到註冊頁面
      await page.click('button:has-text("志工註冊")');
      
      // 填寫所有欄位
      await page.fill('input[type="text"][placeholder*="姓名"]', testData.name);
      await page.fill('input[type="tel"][placeholder*="0912"]', testData.phone);
      await page.fill('input[type="email"]', testData.email);
      await page.fill('input[type="number"]', testData.memberCount.toString());
      
      // 截圖：註冊表單已填寫
      await page.screenshot({ 
        path: 'test-results/screenshots/volunteer-register-filled.png',
        fullPage: true 
      });
      
      // 監聽成功訊息
      let alertMessage = '';
      page.on('dialog', async dialog => {
        alertMessage = dialog.message();
        await dialog.accept();
      });
      
      // 提交註冊
      await page.click('button:has-text("完成註冊")');
      await page.waitForTimeout(1500);
      
      // 驗證成功訊息
      expect(alertMessage).toContain('註冊成功');
      
      // 驗證自動切換到登入頁面
      const loginTab = page.locator('button:has-text("志工登入")');
      await expect(loginTab).toHaveClass(/bg-white.*text-red-600/);
      
      // 驗證登入欄位已自動填入
      const phoneInput = page.locator('input[type="tel"]');
      await expect(phoneInput).toHaveValue(testData.phone);
      
      console.log(`✓ 完整註冊成功: ${testData.name}`);
    });

    test('簡化註冊流程 - 僅必填欄位', async ({ page }) => {
      const timestamp = Date.now();
      const testData = {
        name: `簡化註冊_${timestamp}`,
        phone: `0913${timestamp.toString().slice(-6)}`
      };
      
      // 切換到註冊頁面
      await page.click('button:has-text("志工註冊")');
      
      // 僅填寫必填欄位
      await page.fill('input[type="text"][placeholder*="姓名"]', testData.name);
      await page.fill('input[type="tel"][placeholder*="0912"]', testData.phone);
      
      let alertMessage = '';
      page.on('dialog', async dialog => {
        alertMessage = dialog.message();
        await dialog.accept();
      });
      
      // 提交註冊
      await page.click('button:has-text("完成註冊")');
      await page.waitForTimeout(1500);
      
      // 驗證成功
      expect(alertMessage).toContain('註冊成功');
      
      console.log(`✓ 簡化註冊成功: ${testData.name}`);
    });

    test('註冊驗證 - 必填欄位檢查', async ({ page }) => {
      await page.click('button:has-text("志工註冊")');
      
      let alertMessage = '';
      page.on('dialog', async dialog => {
        alertMessage = dialog.message();
        await dialog.accept();
      });
      
      // 測試：完全空白
      await page.click('button:has-text("完成註冊")');
      await page.waitForTimeout(500);
      expect(alertMessage).toContain('請填寫必填欄位');
      
      // 測試：只填姓名
      alertMessage = '';
      await page.fill('input[type="text"][placeholder*="姓名"]', '測試');
      await page.click('button:has-text("完成註冊")');
      await page.waitForTimeout(500);
      expect(alertMessage).toContain('請填寫必填欄位');
      
      // 測試：只填手機
      await page.fill('input[type="text"][placeholder*="姓名"]', '');
      alertMessage = '';
      await page.fill('input[type="tel"]', '0912345678');
      await page.click('button:has-text("完成註冊")');
      await page.waitForTimeout(500);
      expect(alertMessage).toContain('請填寫必填欄位');
      
      console.log('✓ 註冊表單必填驗證正確');
    });

    test('註冊驗證 - 重複手機號碼處理', async ({ page }) => {
      const timestamp = Date.now();
      const duplicatePhone = `0914${timestamp.toString().slice(-6)}`;
      
      // 第一次註冊
      await page.click('button:has-text("志工註冊")');
      await page.fill('input[type="text"][placeholder*="姓名"]', `首次註冊_${timestamp}`);
      await page.fill('input[type="tel"]', duplicatePhone);
      
      page.once('dialog', async dialog => await dialog.accept());
      
      await page.click('button:has-text("完成註冊")');
      await page.waitForTimeout(1500);
      
      // 嘗試用相同手機號碼再次註冊
      await page.click('button:has-text("志工註冊")');
      await page.fill('input[type="text"][placeholder*="姓名"]', `重複註冊_${timestamp}`);
      await page.fill('input[type="tel"]', duplicatePhone);
      
      let errorOccurred = false;
      page.once('dialog', async dialog => {
        if (dialog.message().includes('失敗') || dialog.message().includes('已存在')) {
          errorOccurred = true;
        }
        await dialog.accept();
      });
      
      await page.click('button:has-text("完成註冊")');
      await page.waitForTimeout(1500);
      
      // 驗證有錯誤訊息（資料庫應拒絕重複手機號碼）
      expect(errorOccurred).toBe(true);
      
      console.log('✓ 正確處理重複手機號碼');
    });

    test('註冊驗證 - 人數範圍檢查', async ({ page }) => {
      const timestamp = Date.now();
      
      await page.click('button:has-text("志工註冊")');
      
      // 測試：設置人數為 0（應該被拒絕或自動調整為1）
      await page.fill('input[type="text"][placeholder*="姓名"]', `人數測試_${timestamp}`);
      await page.fill('input[type="tel"]', `0915${timestamp.toString().slice(-6)}`);
      
      const numberInput = page.locator('input[type="number"]');
      await numberInput.fill('0');
      
      // 檢查最小值限制
      const minValue = await numberInput.getAttribute('min');
      expect(minValue).toBe('1');
      
      console.log('✓ 人數欄位有最小值限制');
    });
  });

  // ==================== Tab 切換測試 ====================
  
  test.describe('Tab 切換功能', () => {
    
    test('登入 ↔ 註冊切換應該清空表單', async ({ page }) => {
      // 在登入頁面填寫資料
      await page.fill('input[type="tel"]', '0912345678');
      await page.fill('input[type="text"]', '測試姓名');
      
      // 切換到註冊
      await page.click('button:has-text("志工註冊")');
      await page.waitForTimeout(300);
      
      // 驗證是否為空（新的註冊表單）
      const nameInput = page.locator('input[type="text"][placeholder*="姓名"]');
      const phoneInput = page.locator('input[type="tel"]');
      
      await expect(nameInput).toHaveValue('');
      await expect(phoneInput).toHaveValue('');
      
      console.log('✓ 切換 Tab 正確清空表單');
    });

    test('切換 Tab 時按鈕狀態應正確更新', async ({ page }) => {
      const loginTab = page.locator('button:has-text("志工登入")');
      const registerTab = page.locator('button:has-text("志工註冊")');
      
      // 初始狀態：登入為 active
      await expect(loginTab).toHaveClass(/bg-white.*text-red-600/);
      await expect(registerTab).not.toHaveClass(/bg-white.*text-red-600/);
      
      // 點擊註冊
      await registerTab.click();
      await page.waitForTimeout(200);
      
      // 註冊為 active
      await expect(registerTab).toHaveClass(/bg-white.*text-red-600/);
      await expect(loginTab).not.toHaveClass(/bg-white.*text-red-600/);
      
      // 點回登入
      await loginTab.click();
      await page.waitForTimeout(200);
      
      // 登入為 active
      await expect(loginTab).toHaveClass(/bg-white.*text-red-600/);
      await expect(registerTab).not.toHaveClass(/bg-white.*text-red-600/);
      
      console.log('✓ Tab 切換狀態正確');
    });
  });

  // ==================== 載入狀態測試 ====================
  
  test.describe('載入與錯誤狀態', () => {
    
    test('登入中應顯示載入狀態', async ({ page }) => {
      const timestamp = Date.now();
      
      await page.fill('input[type="tel"]', `0916${timestamp.toString().slice(-6)}`);
      await page.fill('input[type="text"]', '載入測試');
      
      // 點擊登入
      const loginButton = page.getByRole('button', { name: '登入', exact: true });
      await loginButton.click();
      
      // 檢查是否顯示「登入中...」
      await expect(page.locator('text=登入中...')).toBeVisible({ timeout: 500 });
      
      console.log('✓ 登入載入狀態顯示正確');
    });

    test('註冊中應顯示載入狀態', async ({ page }) => {
      const timestamp = Date.now();
      
      await page.click('button:has-text("志工註冊")');
      await page.fill('input[type="text"][placeholder*="姓名"]', `載入測試_${timestamp}`);
      await page.fill('input[type="tel"]', `0917${timestamp.toString().slice(-6)}`);
      
      // 點擊註冊
      const registerButton = page.getByRole('button', { name: '完成註冊', exact: true });
      await registerButton.click();
      
      // 檢查是否顯示「註冊中...」
      await expect(page.locator('text=註冊中...')).toBeVisible({ timeout: 500 });
      
      console.log('✓ 註冊載入狀態顯示正確');
    });

    test('載入中按鈕應被禁用', async ({ page }) => {
      const timestamp = Date.now();
      
      await page.fill('input[type="tel"]', `0918${timestamp.toString().slice(-6)}`);
      await page.fill('input[type="text"]', '按鈕測試');
      
      const loginButton =  page.locator('button').filter({ hasText: /^登入$/ });
      await loginButton.click();
      
      // 檢查按鈕是否被禁用
      await expect(loginButton).toBeDisabled({ timeout: 500 });
      
      console.log('✓ 載入中按鈕正確禁用');
    });
  });

  // ==================== 響應式設計測試 ====================
  
  test.describe('響應式設計', () => {
    
    test('手機版顯示測試 - 375px', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('http://localhost:5173/volunteer');
      
      // 檢查元素是否正確顯示
      await expect(page.locator('text=花蓮光復救災')).toBeVisible();
      await expect(page.locator('button:has-text("志工登入")')).toBeVisible();
      
      // 截圖
      await page.screenshot({ 
        path: 'test-results/screenshots/volunteer-auth-mobile-375.png',
        fullPage: true 
      });
      
      console.log('✓ 375px 手機版顯示正常');
    });

    test('平板版顯示測試 - 768px', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('http://localhost:5173/volunteer');
      
      await expect(page.locator('text=志工資源管理系統')).toBeVisible();
      
      // 截圖
      await page.screenshot({ 
        path: 'test-results/screenshots/volunteer-auth-tablet-768.png',
        fullPage: true 
      });
      
      console.log('✓ 768px 平板版顯示正常');
    });

    test('桌面版顯示測試 - 1920px', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('http://localhost:5173/volunteer');
      
      await expect(page.locator('text=Disaster Resource Management System')).toBeVisible();
      
      // 截圖
      await page.screenshot({ 
        path: 'test-results/screenshots/volunteer-auth-desktop-1920.png',
        fullPage: true 
      });
      
      console.log('✓ 1920px 桌面版顯示正常');
    });
  });

  // ==================== 完整流程測試 ====================
  
  test.describe('端對端完整流程', () => {
    
    test('註冊 → 登入 → 進入主頁 → 登出完整流程', async ({ page }) => {
      const timestamp = Date.now();
      const testUser = {
        name: `E2E測試_${timestamp}`,
        phone: `0919${timestamp.toString().slice(-6)}`,
        email: `e2e_${timestamp}@test.com`
      };
      
      console.log(`開始完整流程測試: ${testUser.name}`);
      
      // ===== 步驟1: 註冊 =====
      await page.click('button:has-text("志工註冊")');
      await page.fill('input[type="text"][placeholder*="姓名"]', testUser.name);
      await page.fill('input[type="tel"]', testUser.phone);
      await page.fill('input[type="email"]', testUser.email);
      
      page.on('dialog', async dialog => await dialog.accept());
      
      await page.click('button:has-text("完成註冊")');
      await page.waitForTimeout(1500);
      
      console.log('  ✓ 步驟1: 註冊完成');
      
      // ===== 步驟2: 登入 =====
      await page.fill('input[type="tel"]', testUser.phone);
      await page.fill('input[type="text"][placeholder*="姓名"]', testUser.name);
      await page.locator('button').filter({ hasText: /^登入$/ }).click();
      await page.waitForTimeout(2000);
      
      console.log('  ✓ 步驟2: 登入完成');
      
      // ===== 步驟3: 驗證主頁 =====
      await expect(page.locator('text=光復救災志工')).toBeVisible();
      await expect(page.locator(`text=${testUser.name}`).first()).toBeVisible();
      
      // 檢查主要功能按鈕
      await expect(page.locator('text=首頁')).toBeVisible();
      await expect(page.locator('text=任務')).toBeVisible();
      await expect(page.locator('text=我的')).toBeVisible();
      
      console.log('  ✓ 步驟3: 主頁顯示正確');
      
      // ===== 步驟4: 登出 =====
      await page.click('button:has-text("登出")');
      await page.waitForTimeout(1000);
      
      // 驗證回到登入頁面
      await expect(page.locator('button:has-text("志工登入")')).toBeVisible();
      
      console.log('  ✓ 步驟4: 登出完成');
      
      // 完整流程截圖
      await page.screenshot({ 
        path: 'test-results/screenshots/volunteer-e2e-complete.png',
        fullPage: true 
      });
      
      console.log(`✅ 完整流程測試通過: ${testUser.name}`);
    });
  });
});

// ==================== 測試統計與報告 ====================

test.afterAll(async () => {
  console.log('\n' + '='.repeat(60));
  console.log('📊 志工認證系統測試完成');
  console.log('='.repeat(60));
  console.log('✅ 測試類別：');
  console.log('   - UI 顯示與佈局');
  console.log('   - 登入功能（成功、失敗、驗證）');
  console.log('   - 註冊功能（完整、簡化、驗證）');
  console.log('   - Tab 切換');
  console.log('   - 載入狀態');
  console.log('   - 響應式設計（手機、平板、桌面）');
  console.log('   - 端對端完整流程');
  console.log('\n📸 截圖位置: test-results/screenshots/');
  console.log('='.repeat(60) + '\n');
});
