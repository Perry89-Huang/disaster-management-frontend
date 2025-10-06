// e2e/helpers/auth-helpers.js

/**
 * 志工認證測試輔助函數（優化版）
 * 修正所有已知問題並提升穩定性
 */

/**
 * 產生測試用志工資料（加強唯一性）
 */
export function generateTestVolunteerAuth(prefix = '測試志工') {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100000);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  
  return {
    name: `${prefix}_${timestamp}_${randomSuffix}`,
    phone: `092${(timestamp + random).toString().slice(-7)}`,
    email: `test_${timestamp}_${randomSuffix}@example.com`,
    memberCount: Math.floor(Math.random() * 5) + 1 // 1-5人
  };
}

/**
 * 快速註冊志工（優化版）
 * @param {Page} page - Playwright page 物件
 * @param {Object} data - 志工資料（可選）
 * @returns {Object} 註冊的志工資料
 */
export async function quickRegisterVolunteer(page, data = null) {
  const volunteerData = data || generateTestVolunteerAuth();
  
  console.log(`📝 註冊志工: ${volunteerData.name}`);
  
  // 前往志工頁面
  await page.goto('http://localhost:5173/volunteer');
  await page.waitForLoadState('networkidle');
  
  // 切換到註冊頁面
  const registerTab = page.locator('button:has-text("志工註冊")');
  const isRegisterActive = await registerTab.evaluate(el => 
    el.className.includes('bg-white')
  );
  
  if (!isRegisterActive) {
    await registerTab.click();
    await page.waitForTimeout(300);
  }
  
  // 填寫表單
  await page.fill('input[type="text"][placeholder*="姓名"]', volunteerData.name);
  await page.fill('input[type="tel"]', volunteerData.phone);
  
  if (volunteerData.email) {
    await page.fill('input[type="email"]', volunteerData.email);
  }
  
  if (volunteerData.memberCount) {
    await page.fill('input[type="number"]', volunteerData.memberCount.toString());
  }
  
  // ✅ 處理 alert - 使用 once
  let registerSuccess = false;
  let alertMessage = '';
  
  page.once('dialog', async dialog => {
    alertMessage = dialog.message();
    console.log(`  ℹ️  Alert: ${alertMessage}`);
    
    if (alertMessage.includes('成功')) {
      registerSuccess = true;
    }
    
    await dialog.accept();
  });
  
  // 提交註冊
  await page.click('button:has-text("完成註冊")');
  await page.waitForTimeout(1500);
  
  if (registerSuccess) {
    console.log(`  ✅ 註冊成功: ${volunteerData.name}`);
  } else {
    console.log(`  ⚠️  註冊訊息: ${alertMessage}`);
    
    // 如果是重複註冊，生成新資料重試一次
    if (alertMessage.includes('已') || alertMessage.includes('重複')) {
      console.log(`  🔄 偵測到重複，重新產生資料...`);
      
      const newData = generateTestVolunteerAuth(volunteerData.name.split('_')[0]);
      console.log(`  新資料: ${newData.name} (${newData.phone})`);
      
      // 重新填寫
      await page.fill('input[type="text"][placeholder*="姓名"]', newData.name);
      await page.fill('input[type="tel"]', newData.phone);
      
      page.once('dialog', async dialog => {
        console.log(`  ℹ️  重試: ${dialog.message()}`);
        await dialog.accept();
      });
      
      await page.click('button:has-text("完成註冊")');
      await page.waitForTimeout(1500);
      
      return newData;
    }
  }
  
  return volunteerData;
}

/**
 * 快速登入志工（優化版）
 * @param {Page} page - Playwright page 物件
 * @param {String} phone - 手機號碼
 * @param {String} name - 姓名
 * @returns {Boolean} 登入是否成功
 */
export async function quickLoginVolunteer(page, phone, name) {
  console.log(`🔐 登入志工: ${name} (${phone})`);
  
  // ✅ 確保從乾淨的登入頁面開始
  await page.goto('http://localhost:5173/volunteer');
  await page.waitForLoadState('networkidle');
  
  // 確保在登入頁面
  const loginTab = page.locator('button:has-text("志工登入")');
  const isLoginActive = await loginTab.evaluate(el => 
    el.className.includes('bg-white')
  );
  
  if (!isLoginActive) {
    await loginTab.click();
    await page.waitForTimeout(300);
  }
  
  // ✅ 確認現在是在登入頁面（沒有已登入狀態）
  const hasLogoutButton = await page.locator('button:has-text("登出")').isVisible();
  if (hasLogoutButton) {
    console.log(`  ⚠️  偵測到已登入狀態，先登出...`);
    await page.click('button:has-text("登出")');
    await page.waitForTimeout(1000);
    await page.goto('http://localhost:5173/volunteer');
    await page.waitForLoadState('networkidle');
  }
  
  // 清空並填寫登入表單
  await page.fill('input[type="tel"]', '');
  await page.fill('input[type="text"][placeholder*="姓名"]', '');
  
  await page.fill('input[type="tel"]', phone);
  await page.fill('input[type="text"][placeholder*="姓名"]', name);
  
  let loginSuccess = false;
  let alertMessage = '';
  
  // 監聽 alert
  page.once('dialog', async dialog => {
    alertMessage = dialog.message();
    console.log(`  ℹ️  Alert: ${alertMessage}`);
    
    // ✅ 更嚴格的判斷：必須明確包含成功標記
    if (alertMessage.includes('✅') && 
        alertMessage.includes('成功') && 
        !alertMessage.includes('失敗') &&
        !alertMessage.includes('找不到')) {
      loginSuccess = true;
    }
    
    await dialog.accept();
  });
  
  // 點擊登入
  const loginButton = page.locator('button').filter({ hasText: /^登入$/ }).first();
  await loginButton.click();
  
  // 等待處理完成
  await page.waitForTimeout(2000);
  
  // ✅ 改善判斷邏輯：檢查是否真的進入主頁
  const hasLoginTab = await page.locator('button:has-text("志工登入")').isVisible();
  const hasMainPageTitle = await page.locator('text=光復救災志工').isVisible();
  const hasLogout = await page.locator('button:has-text("登出")').isVisible();
  
  console.log(`  📊 狀態檢查:`);
  console.log(`     - 還在登入頁面: ${hasLoginTab}`);
  console.log(`     - 有主頁標題: ${hasMainPageTitle}`);
  console.log(`     - 有登出按鈕: ${hasLogout}`);
  console.log(`     - Alert 訊息: ${alertMessage}`);
  
  // ✅ 嚴格判斷：必須同時滿足多個條件
  if (!hasLoginTab && hasMainPageTitle && hasLogout) {
    loginSuccess = true;
    console.log(`  ✅ 登入成功`);
  } else {
    loginSuccess = false;
    console.log(`  ❌ 登入失敗`);
  }
  
  return loginSuccess;
}

/**
 * 註冊並登入志工（完整流程）（優化版）
 * @param {Page} page - Playwright page 物件
 * @param {Object} data - 志工資料（可選）
 * @returns {Object} 志工資料
 */
export async function registerAndLogin(page, data = null) {
  const volunteerData = await quickRegisterVolunteer(page, data);
  
  console.log(`🔄 開始登入: ${volunteerData.name}`);
  
  // 確保在登入頁面
  const loginTab = page.locator('button:has-text("志工登入")');
  const isLoginPage = await loginTab.isVisible();
  
  if (!isLoginPage) {
    await page.goto('http://localhost:5173/volunteer');
    await page.waitForLoadState('networkidle');
  }
  
  // 清空並填寫登入表單
  await page.fill('input[type="tel"]', '');
  await page.fill('input[type="text"][placeholder*="姓名"]', '');
  
  await page.fill('input[type="tel"]', volunteerData.phone);
  await page.fill('input[type="text"][placeholder*="姓名"]', volunteerData.name);
  
  // ✅ 使用 once
  page.once('dialog', async dialog => {
    console.log(`  ℹ️  登入: ${dialog.message()}`);
    await dialog.accept();
  });
  
  // ✅ 使用精確選擇器
  const loginButton = page.locator('button').filter({ hasText: /^登入$/ }).first();
  await loginButton.click();
  await page.waitForTimeout(2000);
  
  console.log(`🎉 完整流程完成: ${volunteerData.name}`);
  
  return volunteerData;
}

/**
 * 登出志工（優化版）
 * @param {Page} page - Playwright page 物件
 */
export async function logoutVolunteer(page) {
  console.log(`👋 登出志工`);
  
  try {
    const logoutButton = page.locator('button:has-text("登出")');
    await logoutButton.click({ timeout: 3000 });
    await page.waitForTimeout(1000);
    
    // 驗證回到登入頁面
    const isBackToLogin = await page.locator('button:has-text("志工登入")').isVisible();
    
    if (isBackToLogin) {
      console.log(`  ✅ 已登出`);
      return true;
    } else {
      console.log(`  ⚠️  登出狀態不明確`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ 登出失敗: ${error.message}`);
    return false;
  }
}

/**
 * 驗證登入狀態（優化版）
 * @param {Page} page - Playwright page 物件
 * @returns {Boolean} 是否已登入
 */
export async function isVolunteerLoggedIn(page) {
  try {
    await page.waitForSelector('text=光復救災志工', { timeout: 2000 });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 驗證志工資料是否顯示（優化版）
 * @param {Page} page - Playwright page 物件
 * @param {String} name - 志工姓名
 * @returns {Boolean} 資料是否顯示
 */
export async function verifyVolunteerInfo(page, name) {
  try {
    // ✅ 使用 first() 避免 strict mode 錯誤
    await page.waitForSelector(`text=${name}`, { timeout: 2000 });
    const isVisible = await page.locator(`text=${name}`).first().isVisible();
    return isVisible;
  } catch (e) {
    return false;
  }
}

/**
 * 切換認證模式（登入/註冊）（優化版）
 * @param {Page} page - Playwright page 物件
 * @param {String} mode - 'login' 或 'register'
 */
export async function switchAuthMode(page, mode) {
  const buttonText = mode === 'login' ? '志工登入' : '志工註冊';
  const button = page.locator(`button:has-text("${buttonText}")`);
  
  // 檢查是否已經在目標模式
  const isActive = await button.evaluate(el => el.className.includes('bg-white'));
  
  if (!isActive) {
    await button.click();
    await page.waitForTimeout(300);
  }
}

/**
 * 填寫註冊表單（優化版）
 * @param {Page} page - Playwright page 物件
 * @param {Object} data - 表單資料
 */
export async function fillRegisterForm(page, data) {
  if (data.name) {
    await page.fill('input[type="text"][placeholder*="姓名"]', data.name);
  }
  
  if (data.phone) {
    await page.fill('input[type="tel"]', data.phone);
  }
  
  if (data.email) {
    await page.fill('input[type="email"]', data.email);
  }
  
  if (data.memberCount) {
    await page.fill('input[type="number"]', data.memberCount.toString());
  }
}

/**
 * 填寫登入表單（優化版）
 * @param {Page} page - Playwright page 物件
 * @param {String} phone - 手機號碼
 * @param {String} name - 姓名
 */
export async function fillLoginForm(page, phone, name) {
  // 清空再填寫，確保資料正確
  await page.fill('input[type="tel"]', '');
  await page.fill('input[type="text"][placeholder*="姓名"]', '');
  
  await page.fill('input[type="tel"]', phone);
  await page.fill('input[type="text"][placeholder*="姓名"]', name);
}

/**
 * 批次建立測試志工（優化版）
 * @param {Page} page - Playwright page 物件
 * @param {Number} count - 建立數量
 * @param {String} prefix - 名稱前綴
 * @returns {Array} 志工資料陣列
 */
export async function createMultipleTestVolunteers(page, count, prefix = '批次測試') {
  const volunteers = [];
  
  console.log(`📦 批次建立 ${count} 位測試志工...`);
  
  for (let i = 0; i < count; i++) {
    const data = generateTestVolunteerAuth(`${prefix}_${i + 1}`);
    
    try {
      const volunteer = await quickRegisterVolunteer(page, data);
      volunteers.push(volunteer);
      
      if ((i + 1) % 5 === 0) {
        console.log(`  進度: ${i + 1}/${count}`);
      }
      
      // 避免過快請求
      await page.waitForTimeout(300);
    } catch (error) {
      console.error(`  ❌ 第 ${i + 1} 位建立失敗:`, error.message);
      // 繼續執行，不中斷
    }
  }
  
  console.log(`✅ 批次建立完成，成功 ${volunteers.length}/${count} 位志工`);
  
  return volunteers;
}

/**
 * 截圖輔助函數（優化版）
 * @param {Page} page - Playwright page 物件
 * @param {String} name - 截圖名稱
 * @param {Boolean} fullPage - 是否全頁截圖
 */
export async function takeScreenshot(page, name, fullPage = true) {
  try {
    const path = `test-results/screenshots/${name}.png`;
    await page.screenshot({ path, fullPage });
    console.log(`📸 截圖已儲存: ${path}`);
  } catch (error) {
    console.warn(`⚠️  截圖失敗: ${error.message}`);
  }
}

/**
 * 等待並處理 Alert（優化版）
 * @param {Page} page - Playwright page 物件
 * @param {Function} callback - 處理 alert 的回調函數
 */
export async function handleAlert(page, callback) {
  // ✅ 使用 once 而不是 on
  page.once('dialog', async dialog => {
    if (callback) {
      callback(dialog.message());
    }
    await dialog.accept();
  });
}

/**
 * 驗證表單錯誤訊息（優化版）
 * @param {Page} page - Playwright page 物件
 * @param {String} expectedMessage - 預期的錯誤訊息
 * @returns {Promise<Boolean>} 是否出現預期的錯誤訊息
 */
export async function verifyErrorMessage(page, expectedMessage) {
  return new Promise((resolve) => {
    let foundError = false;
    
    // ✅ 使用 once
    page.once('dialog', async dialog => {
      if (dialog.message().includes(expectedMessage)) {
        foundError = true;
      }
      await dialog.accept();
      resolve(foundError);
    });
    
    // 設定超時
    setTimeout(() => {
      resolve(foundError);
    }, 5000);
  });
}

/**
 * 清理測試志工（需要管理員權限）
 * @param {Page} page - Playwright page 物件
 * @param {String} pattern - 名稱模式
 */
export async function cleanupTestVolunteers(page, pattern = '測試') {
  console.log(`🧹 清理測試志工（名稱包含: ${pattern}）`);
  console.log(`  ℹ️  此功能需要管理員權限，目前跳過`);
  // 實際使用時需要實作
}

// 匯出所有函數
export default {
  generateTestVolunteerAuth,
  quickRegisterVolunteer,
  quickLoginVolunteer,
  registerAndLogin,
  logoutVolunteer,
  isVolunteerLoggedIn,
  verifyVolunteerInfo,
  switchAuthMode,
  fillRegisterForm,
  fillLoginForm,
  createMultipleTestVolunteers,
  takeScreenshot,
  handleAlert,
  verifyErrorMessage,
  cleanupTestVolunteers
};