// e2e/helpers/request-helpers.js

/**
 * 需求管理測試輔助函數
 * 用於簡化測試程式碼並提供可重用的操作
 */

/**
 * 產生測試用需求資料
 * @param {string} prefix - 名稱前綴（用於識別測試資料）
 * @returns {Object} 需求資料物件
 */
export function generateTestRequest(prefix = '測試需求') {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  
  const villages = ['東富村', '西富村', '南富村', '北富村', '大富村'];
  const streets = ['中正路', '光復街', '民生路', '佛祖街', '和平街'];
  const requestTypes = ['志工', '物資', '志工+物資'];
  const priorities = ['urgent', 'high', 'normal', 'low'];
  
  return {
    request_type: requestTypes[random % requestTypes.length],
    priority: priorities[random % priorities.length],
    village: villages[random % villages.length],
    street: `${streets[random % streets.length]}${random}號`,
    contact_name: `${prefix}_${timestamp}`,
    contact_phone: `09${String(random).padStart(8, '0')}`,
    required_volunteers: Math.floor(Math.random() * 5) + 1,
    description: `${prefix}_描述_${timestamp}_需要協助清理淤泥和搬運物資`
  };
}

/**
 * 建立需求
 * @param {Page} page - Playwright 頁面物件
 * @param {Object} requestData - 需求資料（選填）
 * @returns {Promise<Object>} 包含建立的需求資料
 */
export async function createRequest(page, requestData = null) {
  const data = requestData || generateTestRequest();
  
  console.log(`\n📝 建立需求: ${data.contact_name}`);
  
  // 點擊新增需求按鈕
  await page.click('button:has-text("新增需求")');
  await page.waitForTimeout(500);
  
  // 填寫表單
  await page.selectOption('select:near(:text("需求類型"))', data.request_type);
  await page.selectOption('select:near(:text("優先順序"))', data.priority);
  await page.fill('input[placeholder*="東富村"]', data.village);
  await page.fill('input[placeholder*="佛祖街"]', data.street);
  await page.fill('input[placeholder*="聯絡人姓名"]', data.contact_name);
  await page.fill('input[placeholder*="0912-345-678"]', data.contact_phone);
  await page.fill('input[type="number"]', String(data.required_volunteers));
  await page.fill('textarea[placeholder*="需求內容"]', data.description);
  
  // 截圖：已填寫的表單
  await page.screenshot({ 
    path: 'test-results/screenshots/request-form-filled.png',
    fullPage: true 
  });
  
  // 提交表單
  await page.click('button:has-text("建立需求")');
  await page.waitForTimeout(1000);
  
  console.log(`✓ 需求建立成功`);
  
  return data;
}

/**
 * 編輯需求
 * @param {Page} page - Playwright 頁面物件
 * @param {string} contactName - 聯絡人姓名
 * @param {Object} updates - 要更新的欄位
 */
export async function editRequest(page, contactName, updates) {
  console.log(`\n✏️ 編輯需求: ${contactName}`);
  
  // 找到需求卡片並點擊編輯
  const requestCard = page.locator(`div:has-text("${contactName}")`).first();
  await requestCard.locator('button:has-text("編輯")').click();
  await page.waitForTimeout(500);
  
  // 更新欄位
  if (updates.request_type) {
    await page.selectOption('select:near(:text("需求類型"))', updates.request_type);
  }
  if (updates.priority) {
    await page.selectOption('select:near(:text("優先順序"))', updates.priority);
  }
  if (updates.village) {
    await page.fill('input[placeholder*="東富村"]', updates.village);
  }
  if (updates.street) {
    await page.fill('input[placeholder*="佛祖街"]', updates.street);
  }
  if (updates.contact_name) {
    await page.fill('input[placeholder*="聯絡人姓名"]', updates.contact_name);
  }
  if (updates.contact_phone) {
    await page.fill('input[placeholder*="0912-345-678"]', updates.contact_phone);
  }
  if (updates.required_volunteers !== undefined) {
    await page.fill('input[type="number"]', String(updates.required_volunteers));
  }
  if (updates.description) {
    await page.fill('textarea[placeholder*="需求內容"]', updates.description);
  }
  
  // 截圖：編輯表單
  await page.screenshot({ 
    path: 'test-results/screenshots/request-edit-form.png',
    fullPage: true 
  });
  
  // 提交更新
  await page.click('button:has-text("更新")');
  await page.waitForTimeout(1000);
  
  console.log(`✓ 需求更新成功`);
}

/**
 * 刪除需求
 * @param {Page} page - Playwright 頁面物件
 * @param {string} contactName - 聯絡人姓名
 * @param {boolean} confirm - 是否確認刪除
 */
export async function deleteRequest(page, contactName, confirm = true) {
  console.log(`\n🗑️ 刪除需求: ${contactName}`);
  
  // 找到需求卡片並點擊刪除
  const requestCard = page.locator(`div:has-text("${contactName}")`).first();
  await requestCard.locator('button:has-text("刪除")').click();
  await page.waitForTimeout(300);
  
  // 處理確認對話框
  page.once('dialog', async dialog => {
    console.log(`對話框訊息: ${dialog.message()}`);
    if (confirm) {
      await dialog.accept();
      console.log('✓ 確認刪除');
    } else {
      await dialog.dismiss();
      console.log('✓ 取消刪除');
    }
  });
  
  await page.waitForTimeout(1000);
  
  if (confirm) {
    console.log(`✓ 需求已刪除`);
  }
}

/**
 * 檢查需求是否存在
 * @param {Page} page - Playwright 頁面物件
 * @param {string} contactName - 聯絡人姓名
 * @returns {Promise<boolean>} 是否存在
 */
export async function requestExists(page, contactName) {
  const count = await page.locator(`div:has-text("${contactName}")`).count();
  const exists = count > 0;
  console.log(`檢查需求 "${contactName}": ${exists ? '存在' : '不存在'}`);
  return exists;
}

/**
 * 檢查需求是否不存在
 * @param {Page} page - Playwright 頁面物件
 * @param {string} contactName - 聯絡人姓名
 * @returns {Promise<boolean>} 是否不存在
 */
export async function requestNotExists(page, contactName) {
  const exists = await requestExists(page, contactName);
  return !exists;
}

/**
 * 切換狀態篩選
 * @param {Page} page - Playwright 頁面物件
 * @param {string} status - 狀態（all/pending/in_progress/completed/cancelled）
 */
export async function filterByStatus(page, status) {
  console.log(`\n🔍 切換篩選: ${status}`);
  
  const statusMap = {
    'all': '全部',
    'pending': '待支援',
    'in_progress': '進行中',
    'completed': '已完成',
    'cancelled': '已取消'
  };
  
  const buttonText = statusMap[status] || status;
  await page.click(`button:has-text("${buttonText}")`);
  await page.waitForTimeout(500);
  
  console.log(`✓ 已切換到 ${buttonText} 篩選`);
}

/**
 * 取得狀態統計數字
 * @param {Page} page - Playwright 頁面物件
 * @returns {Promise<Object>} 各狀態的數量
 */
export async function getStatusStats(page) {
  console.log(`\n📊 取得狀態統計`);
  
  const stats = {
    pending: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0
  };
  
  // 從統計卡片中讀取數字
  const statsCards = page.locator('.bg-gradient-to-br').filter({ hasText: /待支援|進行中|已完成|已取消/ });
  const count = await statsCards.count();
  
  for (let i = 0; i < count; i++) {
    const card = statsCards.nth(i);
    const text = await card.textContent();
    const number = parseInt(text.match(/\d+/)?.[0] || '0');
    
    if (text.includes('待支援')) stats.pending = number;
    if (text.includes('進行中')) stats.in_progress = number;
    if (text.includes('已完成')) stats.completed = number;
    if (text.includes('已取消')) stats.cancelled = number;
  }
  
  console.log(`統計: 待支援=${stats.pending}, 進行中=${stats.in_progress}, 已完成=${stats.completed}, 已取消=${stats.cancelled}`);
  
  return stats;
}

/**
 * 批次建立多個需求
 * @param {Page} page - Playwright 頁面物件
 * @param {number} count - 建立數量
 * @param {string} prefix - 名稱前綴
 * @returns {Promise<Array>} 建立的需求資料陣列
 */
export async function createMultipleRequests(page, count, prefix = '測試需求') {
  console.log(`\n📝 批次建立 ${count} 個需求`);
  
  const requests = [];
  
  for (let i = 0; i < count; i++) {
    const data = generateTestRequest(`${prefix}_${i + 1}`);
    await createRequest(page, data);
    requests.push(data);
    console.log(`✓ 已建立 ${i + 1}/${count}`);
  }
  
  // 截圖：批次建立結果
  await page.screenshot({ 
    path: 'test-results/screenshots/batch-requests.png',
    fullPage: true 
  });
  
  console.log(`✓ 批次建立完成，共 ${count} 個需求`);
  
  return requests;
}

/**
 * 清理測試需求（根據聯絡人名稱前綴）
 * @param {Page} page - Playwright 頁面物件
 * @param {string} prefix - 名稱前綴
 */
export async function cleanupTestRequests(page, prefix) {
  console.log(`\n🧹 清理測試需求（前綴: ${prefix}）`);
  
  // 切換到「全部」篩選以確保看到所有需求
  await filterByStatus(page, 'all');
  await page.waitForTimeout(1000);
  
  let deletedCount = 0;
  let maxAttempts = 50; // 防止無限迴圈
  
  while (maxAttempts > 0) {
    // 尋找包含前綴的需求
    const testRequests = page.locator(`div:has-text("${prefix}")`).filter({ hasText: /聯絡人/ });
    const count = await testRequests.count();
    
    if (count === 0) {
      break;
    }
    
    // 找到第一個測試需求的聯絡人名稱
    const firstRequest = testRequests.first();
    const text = await firstRequest.textContent();
    const nameMatch = text.match(new RegExp(`${prefix}[^\\s]*`));
    
    if (nameMatch) {
      const contactName = nameMatch[0];
      await deleteRequest(page, contactName, true);
      deletedCount++;
    }
    
    maxAttempts--;
    await page.waitForTimeout(500);
  }
  
  console.log(`✓ 清理完成，刪除了 ${deletedCount} 個測試需求`);
}

/**
 * 驗證需求詳細資訊
 * @param {Page} page - Playwright 頁面物件
 * @param {string} contactName - 聯絡人姓名
 * @param {Object} expectedData - 預期的資料
 * @returns {Promise<boolean>} 驗證是否通過
 */
export async function verifyRequestDetails(page, contactName, expectedData) {
  console.log(`\n🔍 驗證需求詳細資訊: ${contactName}`);
  
  const requestCard = page.locator(`div:has-text("${contactName}")`).first();
  const cardText = await requestCard.textContent();
  
  let allMatch = true;
  
  if (expectedData.village && !cardText.includes(expectedData.village)) {
    console.log(`❌ 村里不符: 預期 ${expectedData.village}`);
    allMatch = false;
  }
  
  if (expectedData.street && !cardText.includes(expectedData.street)) {
    console.log(`❌ 街道不符: 預期 ${expectedData.street}`);
    allMatch = false;
  }
  
  if (expectedData.contact_phone && !cardText.includes(expectedData.contact_phone)) {
    console.log(`❌ 電話不符: 預期 ${expectedData.contact_phone}`);
    allMatch = false;
  }
  
  if (expectedData.description && !cardText.includes(expectedData.description)) {
    console.log(`❌ 描述不符: 預期 ${expectedData.description}`);
    allMatch = false;
  }
  
  if (allMatch) {
    console.log(`✓ 所有資料驗證通過`);
  }
  
  return allMatch;
}