// e2e/admin/request-management.spec.js

import { test, expect } from '@playwright/test';
import {
  generateTestRequest,
  createRequest,
  editRequest,
  deleteRequest,
  requestExists,
  requestNotExists,
  filterByStatus,
  getStatusStats,
  createMultipleRequests,
  cleanupTestRequests,
  verifyRequestDetails
} from '../helpers/request-helpers.js';

/**
 * 需求管理完整測試套件
 * 測試管理員的需求 CRUD 功能
 */

test.describe('需求管理 - 完整測試', () => {
  
  test.beforeEach(async ({ page }) => {
    console.log('\n🚀 開始測試：導航到管理員頁面');
    
    // 導航到管理員頁面
    await page.goto('http://localhost:5173/admin');
    await page.waitForLoadState('networkidle');
    
    // 切換到需求管理 tab
    await page.click('button:has-text("需求管理")');
    await page.waitForTimeout(1000);
    
    // 截圖：初始狀態
    await page.screenshot({ 
      path: 'test-results/screenshots/request-initial.png',
      fullPage: true 
    });
    
    console.log('✓ 頁面載入完成，已切換到需求管理');
  });

  test.afterEach(async ({ page }) => {
    console.log('\n🧹 測試結束：清理測試資料');
    
    // 清理所有測試需求
    await cleanupTestRequests(page, '測試需求');
    
    console.log('✓ 清理完成');
  });

  // ==================== CREATE 測試 ====================
  
  test('C1: 應該可以新增志工需求', async ({ page }) => {
    console.log('\n📝 測試：新增志工需求');
    
    // 建立需求
    const requestData = generateTestRequest('測試需求_志工');
    requestData.request_type = '志工';
    const result = await createRequest(page, requestData);
    
    // 驗證需求存在
    const exists = await requestExists(page, result.contact_name);
    expect(exists).toBe(true);
    
    // 驗證詳細資訊
    const verified = await verifyRequestDetails(page, result.contact_name, result);
    expect(verified).toBe(true);
    
    console.log('✅ 測試通過：志工需求新增成功');
  });

  test('C2: 應該可以新增物資需求', async ({ page }) => {
    console.log('\n📝 測試：新增物資需求');
    
    const requestData = generateTestRequest('測試需求_物資');
    requestData.request_type = '物資';
    const result = await createRequest(page, requestData);
    
    const exists = await requestExists(page, result.contact_name);
    expect(exists).toBe(true);
    
    console.log('✅ 測試通過：物資需求新增成功');
  });

  test('C3: 應該可以新增志工+物資需求', async ({ page }) => {
    console.log('\n📝 測試：新增志工+物資需求');
    
    const requestData = generateTestRequest('測試需求_混合');
    requestData.request_type = '志工+物資';
    const result = await createRequest(page, requestData);
    
    const exists = await requestExists(page, result.contact_name);
    expect(exists).toBe(true);
    
    console.log('✅ 測試通過：志工+物資需求新增成功');
  });

  test('C4: 應該可以新增不同優先順序的需求', async ({ page }) => {
    console.log('\n📝 測試：新增不同優先順序需求');
    
    const priorities = ['urgent', 'high', 'normal', 'low'];
    const priorityNames = ['緊急', '高', '普通', '低'];
    
    for (let i = 0; i < priorities.length; i++) {
      const requestData = generateTestRequest(`測試需求_${priorityNames[i]}`);
      requestData.priority = priorities[i];
      const result = await createRequest(page, requestData);
      
      const exists = await requestExists(page, result.contact_name);
      expect(exists).toBe(true);
      
      console.log(`✓ ${priorityNames[i]}優先順序需求建立成功`);
    }
    
    console.log('✅ 測試通過：所有優先順序需求新增成功');
  });

  test('C5: 應該可以新增需要特定人數的需求', async ({ page }) => {
    console.log('\n📝 測試：新增需要特定人數的需求');
    
    const requestData = generateTestRequest('測試需求_5人');
    requestData.required_volunteers = 5;
    const result = await createRequest(page, requestData);
    
    const exists = await requestExists(page, result.contact_name);
    expect(exists).toBe(true);
    
    // 驗證人數顯示
    const requestCard = page.locator(`div:has-text("${result.contact_name}")`).first();
    const cardText = await requestCard.textContent();
    expect(cardText).toContain('5');
    
    console.log('✅ 測試通過：特定人數需求新增成功');
  });

  // ==================== READ 測試 ====================
  
  test('R1: 應該可以查看所有需求列表', async ({ page }) => {
    console.log('\n👁️ 測試：查看需求列表');
    
    // 建立多個需求
    await createMultipleRequests(page, 3, '測試需求_列表');
    
    // 切換到「全部」篩選
    await filterByStatus(page, 'all');
    
    // 驗證至少有 3 個需求
    const requestCards = page.locator('div').filter({ hasText: /測試需求_列表/ });
    const count = await requestCards.count();
    expect(count).toBeGreaterThanOrEqual(3);
    
    console.log(`✓ 找到 ${count} 個需求`);
    console.log('✅ 測試通過：需求列表顯示正常');
  });

  test('R2: 應該正確顯示需求詳細資訊', async ({ page }) => {
    console.log('\n👁️ 測試：需求詳細資訊顯示');
    
    const requestData = generateTestRequest('測試需求_詳情');
    const result = await createRequest(page, requestData);
    
    // 驗證卡片中包含所有重要資訊
    const requestCard = page.locator(`div:has-text("${result.contact_name}")`).first();
    const cardText = await requestCard.textContent();
    
    expect(cardText).toContain(result.village);
    expect(cardText).toContain(result.street);
    expect(cardText).toContain(result.contact_name);
    expect(cardText).toContain(result.contact_phone);
    expect(cardText).toContain(result.description);
    
    console.log('✅ 測試通過：詳細資訊顯示完整');
  });

  test('R3: 應該正確顯示狀態標籤', async ({ page }) => {
    console.log('\n👁️ 測試：狀態標籤顯示');
    
    const requestData = generateTestRequest('測試需求_狀態');
    const result = await createRequest(page, requestData);
    
    // 新建立的需求應該是 pending 狀態
    const requestCard = page.locator(`div:has-text("${result.contact_name}")`).first();
    const statusBadge = requestCard.locator('span').filter({ hasText: /待支援|進行中|已完成|已取消/ }).first();
    const statusText = await statusBadge.textContent();
    
    expect(statusText).toContain('待支援');
    
    console.log('✅ 測試通過：狀態標籤顯示正確');
  });

  // ==================== UPDATE 測試 ====================
  
  test('U1: 應該可以編輯需求類型', async ({ page }) => {
    console.log('\n✏️ 測試：編輯需求類型');
    
    const requestData = generateTestRequest('測試需求_編輯類型');
    const result = await createRequest(page, requestData);
    
    // 編輯需求類型
    await editRequest(page, result.contact_name, {
      request_type: '物資'
    });
    
    // 驗證更新
    const requestCard = page.locator(`div:has-text("${result.contact_name}")`).first();
    const cardText = await requestCard.textContent();
    expect(cardText).toContain('物資');
    
    console.log('✅ 測試通過：需求類型編輯成功');
  });

  test('U2: 應該可以編輯優先順序', async ({ page }) => {
    console.log('\n✏️ 測試：編輯優先順序');
    
    const requestData = generateTestRequest('測試需求_編輯優先');
    requestData.priority = 'normal';
    const result = await createRequest(page, requestData);
    
    // 編輯為緊急
    await editRequest(page, result.contact_name, {
      priority: 'urgent'
    });
    
    // 驗證更新
    const requestCard = page.locator(`div:has-text("${result.contact_name}")`).first();
    const cardText = await requestCard.textContent();
    expect(cardText).toContain('緊急');
    
    console.log('✅ 測試通過：優先順序編輯成功');
  });

  test('U3: 應該可以編輯地點資訊', async ({ page }) => {
    console.log('\n✏️ 測試：編輯地點資訊');
    
    const requestData = generateTestRequest('測試需求_編輯地點');
    const result = await createRequest(page, requestData);
    
    const newVillage = '新村里';
    const newStreet = '新街道123號';
    
    await editRequest(page, result.contact_name, {
      village: newVillage,
      street: newStreet
    });
    
    // 驗證更新
    const verified = await verifyRequestDetails(page, result.contact_name, {
      village: newVillage,
      street: newStreet
    });
    expect(verified).toBe(true);
    
    console.log('✅ 測試通過：地點資訊編輯成功');
  });

  test('U4: 應該可以編輯聯絡資訊', async ({ page }) => {
    console.log('\n✏️ 測試：編輯聯絡資訊');
    
    const requestData = generateTestRequest('測試需求_編輯聯絡');
    const result = await createRequest(page, requestData);
    
    const newContactName = `更新_${result.contact_name}`;
    const newContactPhone = '0987654321';
    
    await editRequest(page, result.contact_name, {
      contact_name: newContactName,
      contact_phone: newContactPhone
    });
    
    // 驗證更新
    const exists = await requestExists(page, newContactName);
    expect(exists).toBe(true);
    
    const verified = await verifyRequestDetails(page, newContactName, {
      contact_phone: newContactPhone
    });
    expect(verified).toBe(true);
    
    console.log('✅ 測試通過：聯絡資訊編輯成功');
  });

  test('U5: 應該可以編輯需求人數', async ({ page }) => {
    console.log('\n✏️ 測試：編輯需求人數');
    
    const requestData = generateTestRequest('測試需求_編輯人數');
    requestData.required_volunteers = 3;
    const result = await createRequest(page, requestData);
    
    await editRequest(page, result.contact_name, {
      required_volunteers: 10
    });
    
    // 驗證更新
    const requestCard = page.locator(`div:has-text("${result.contact_name}")`).first();
    const cardText = await requestCard.textContent();
    expect(cardText).toContain('10');
    
    console.log('✅ 測試通過：需求人數編輯成功');
  });

  test('U6: 應該可以編輯需求描述', async ({ page }) => {
    console.log('\n✏️ 測試：編輯需求描述');
    
    const requestData = generateTestRequest('測試需求_編輯描述');
    const result = await createRequest(page, requestData);
    
    const newDescription = '更新後的詳細需求描述，包含新的任務內容';
    
    await editRequest(page, result.contact_name, {
      description: newDescription
    });
    
    // 驗證更新
    const verified = await verifyRequestDetails(page, result.contact_name, {
      description: newDescription
    });
    expect(verified).toBe(true);
    
    console.log('✅ 測試通過：需求描述編輯成功');
  });

  // ==================== DELETE 測試 ====================
  
  test('D1: 應該可以刪除需求', async ({ page }) => {
    console.log('\n🗑️ 測試：刪除需求');
    
    const requestData = generateTestRequest('測試需求_刪除');
    const result = await createRequest(page, requestData);
    
    // 確認需求存在
    let exists = await requestExists(page, result.contact_name);
    expect(exists).toBe(true);
    
    // 刪除需求
    await deleteRequest(page, result.contact_name, true);
    
    // 等待 GraphQL 更新
    await page.waitForTimeout(1500);
    
    // 確認需求已刪除
    exists = await requestNotExists(page, result.contact_name);
    expect(exists).toBe(true);
    
    console.log('✅ 測試通過：需求刪除成功');
  });

  test('D2: 應該可以取消刪除需求', async ({ page }) => {
    console.log('\n🗑️ 測試：取消刪除需求');
    
    const requestData = generateTestRequest('測試需求_取消刪除');
    const result = await createRequest(page, requestData);
    
    // 取消刪除
    await deleteRequest(page, result.contact_name, false);
    await page.waitForTimeout(1000);
    
    // 確認需求仍然存在
    const exists = await requestExists(page, result.contact_name);
    expect(exists).toBe(true);
    
    console.log('✅ 測試通過：取消刪除成功');
  });

  test('D3: 應該可以批次刪除多個需求', async ({ page }) => {
    console.log('\n🗑️ 測試：批次刪除需求');
    
    // 建立多個需求
    const requests = await createMultipleRequests(page, 3, '測試需求_批次刪除');
    
    // 確認都存在
    for (const req of requests) {
      const exists = await requestExists(page, req.contact_name);
      expect(exists).toBe(true);
    }
    
    // 逐一刪除
    for (const req of requests) {
      await deleteRequest(page, req.contact_name, true);
      await page.waitForTimeout(1000);
    }
    
    // 確認都已刪除
    for (const req of requests) {
      const exists = await requestNotExists(page, req.contact_name);
      expect(exists).toBe(true);
    }
    
    console.log('✅ 測試通過：批次刪除成功');
  });

  // ==================== 篩選功能測試 ====================
  
  test('F1: 應該可以切換到「全部」篩選', async ({ page }) => {
    console.log('\n🔍 測試：全部篩選');
    
    await createMultipleRequests(page, 2, '測試需求_全部');
    
    await filterByStatus(page, 'all');
    await page.waitForTimeout(1000);
    
    // 驗證按鈕狀態
    const allButton = page.locator('button').filter({ hasText: '全部' });
    const buttonClass = await allButton.getAttribute('class');
    expect(buttonClass).toContain('gradient');
    
    console.log('✅ 測試通過：全部篩選功能正常');
  });

  test('F2: 應該可以切換到「待支援」篩選', async ({ page }) => {
    console.log('\n🔍 測試：待支援篩選');
    
    await filterByStatus(page, 'pending');
    await page.waitForTimeout(1000);
    
    const pendingButton = page.locator('button').filter({ hasText: '待支援' });
    const buttonClass = await pendingButton.getAttribute('class');
    expect(buttonClass).toContain('gradient');
    
    console.log('✅ 測試通過：待支援篩選功能正常');
  });

  test('F3: 應該可以切換到「進行中」篩選', async ({ page }) => {
    console.log('\n🔍 測試：進行中篩選');
    
    await filterByStatus(page, 'in_progress');
    await page.waitForTimeout(1000);
    
    const inProgressButton = page.locator('button').filter({ hasText: '進行中' });
    const buttonClass = await inProgressButton.getAttribute('class');
    expect(buttonClass).toContain('gradient');
    
    console.log('✅ 測試通過：進行中篩選功能正常');
  });

  test('F4: 應該可以切換到「已完成」篩選', async ({ page }) => {
    console.log('\n🔍 測試：已完成篩選');
    
    await filterByStatus(page, 'completed');
    await page.waitForTimeout(1000);
    
    const completedButton = page.locator('button').filter({ hasText: '已完成' });
    const buttonClass = await completedButton.getAttribute('class');
    expect(buttonClass).toContain('gradient');
    
    console.log('✅ 測試通過：已完成篩選功能正常');
  });

  test('F5: 應該可以切換到「已取消」篩選', async ({ page }) => {
    console.log('\n🔍 測試：已取消篩選');
    
    await filterByStatus(page, 'cancelled');
    await page.waitForTimeout(1000);
    
    const cancelledButton = page.locator('button').filter({ hasText: '已取消' });
    const buttonClass = await cancelledButton.getAttribute('class');
    expect(buttonClass).toContain('gradient');
    
    console.log('✅ 測試通過：已取消篩選功能正常');
  });

  // ==================== 統計功能測試 ====================
  
  test('S1: 應該正確顯示統計數字', async ({ page }) => {
    console.log('\n📊 測試：統計數字顯示');
    
    // 建立一些需求
    await createMultipleRequests(page, 3, '測試需求_統計');
    
    // 取得統計
    const stats = await getStatusStats(page);
    
    // 驗證統計數字為正整數
    expect(stats.pending).toBeGreaterThanOrEqual(0);
    expect(stats.in_progress).toBeGreaterThanOrEqual(0);
    expect(stats.completed).toBeGreaterThanOrEqual(0);
    expect(stats.cancelled).toBeGreaterThanOrEqual(0);
    
    // 待支援至少有 3 個（剛建立的）
    expect(stats.pending).toBeGreaterThanOrEqual(3);
    
    console.log('✅ 測試通過：統計數字顯示正確');
  });

  test('S2: 統計數字應該即時更新', async ({ page }) => {
    console.log('\n📊 測試：統計數字即時更新');
    
    // 取得初始統計
    const statsBefore = await getStatusStats(page);
    console.log('新增前統計:', statsBefore);
    
    // 新增 2 個需求
    await createMultipleRequests(page, 2, '測試需求_統計更新');
    
    // 等待更新
    await page.waitForTimeout(2000);
    
    // 取得更新後統計
    const statsAfter = await getStatusStats(page);
    console.log('新增後統計:', statsAfter);
    
    // 驗證待支援數字增加了 2
    expect(statsAfter.pending).toBe(statsBefore.pending + 2);
    
    console.log('✅ 測試通過：統計數字即時更新');
  });

  // ==================== 表單驗證測試 ====================
  
  test('V1: 應該驗證必填欄位', async ({ page }) => {
    console.log('\n✅ 測試：必填欄位驗證');
    
    // 點擊新增需求
    await page.click('button:has-text("新增需求")');
    await page.waitForTimeout(500);
    
    // 不填寫任何欄位，直接提交
    await page.click('button:has-text("建立需求")');
    await page.waitForTimeout(500);
    
    // 應該會觸發 HTML5 驗證或 alert
    // 頁面應該還在表單狀態（沒有關閉）
    const formVisible = await page.locator('h3:has-text("新增需求")').isVisible();
    expect(formVisible).toBe(true);
    
    console.log('✅ 測試通過：必填欄位驗證正常');
  });

  test('V2: 應該接受有效的電話格式', async ({ page }) => {
    console.log('\n✅ 測試：電話格式驗證');
    
    const validPhones = [
      '0912345678',
      '0912-345-678',
      '09-1234-5678',
      '0987654321'
    ];
    
    for (const phone of validPhones) {
      const requestData = generateTestRequest(`測試需求_電話_${phone.replace(/[^0-9]/g, '')}`);
      requestData.contact_phone = phone;
      
      await createRequest(page, requestData);
      
      const exists = await requestExists(page, requestData.contact_name);
      expect(exists).toBe(true);
      
      console.log(`✓ 電話 ${phone} 驗證通過`);
    }
    
    console.log('✅ 測試通過：電話格式驗證正常');
  });

  test('V3: 應該驗證需求人數為正整數', async ({ page }) => {
    console.log('\n✅ 測試：需求人數驗證');
    
    const requestData = generateTestRequest('測試需求_人數驗證');
    requestData.required_volunteers = 5;
    
    await createRequest(page, requestData);
    
    const exists = await requestExists(page, requestData.contact_name);
    expect(exists).toBe(true);
    
    // 驗證人數顯示
    const requestCard = page.locator(`div:has-text("${requestData.contact_name}")`).first();
    const cardText = await requestCard.textContent();
    expect(cardText).toContain('5');
    
    console.log('✅ 測試通過：需求人數驗證正常');
  });

  // ==================== 完整流程測試 ====================
  
  test('E2E1: 完整 CRUD 流程測試', async ({ page }) => {
    console.log('\n🔄 測試：完整 CRUD 流程');
    
    // 1. CREATE - 建立需求
    console.log('\n1️⃣ 步驟 1: 建立需求');
    const requestData = generateTestRequest('測試需求_完整流程');
    const result = await createRequest(page, requestData);
    await page.screenshot({ 
      path: 'test-results/screenshots/request-crud-1-create.png',
      fullPage: true 
    });
    
    // 2. READ - 驗證需求存在
    console.log('\n2️⃣ 步驟 2: 驗證需求存在');
    let exists = await requestExists(page, result.contact_name);
    expect(exists).toBe(true);
    
    // 3. UPDATE - 更新需求
    console.log('\n3️⃣ 步驟 3: 更新需求');
    await editRequest(page, result.contact_name, {
      priority: 'urgent',
      required_volunteers: 10,
      description: '更新後的需求描述 - 完整流程測試'
    });
    await page.screenshot({ 
      path: 'test-results/screenshots/request-crud-2-update.png',
      fullPage: true 
    });
    
    // 4. 驗證更新
    console.log('\n4️⃣ 步驟 4: 驗證更新');
    const verified = await verifyRequestDetails(page, result.contact_name, {
      description: '更新後的需求描述'
    });
    expect(verified).toBe(true);
    
    // 5. DELETE - 刪除需求
    console.log('\n5️⃣ 步驟 5: 刪除需求');
    await deleteRequest(page, result.contact_name, true);
    await page.waitForTimeout(1500);
    await page.screenshot({ 
      path: 'test-results/screenshots/request-crud-3-delete.png',
      fullPage: true 
    });
    
    // 6. 驗證刪除
    console.log('\n6️⃣ 步驟 6: 驗證刪除');
    exists = await requestNotExists(page, result.contact_name);
    expect(exists).toBe(true);
    
    console.log('✅ 測試通過：完整 CRUD 流程執行成功');
  });

  test('E2E2: 批次操作流程測試', async ({ page }) => {
    console.log('\n🔄 測試：批次操作流程');
    
    // 1. 批次建立
    console.log('\n1️⃣ 批次建立 5 個需求');
    const requests = await createMultipleRequests(page, 5, '測試需求_批次');
    
    // 2. 驗證統計
    console.log('\n2️⃣ 驗證統計數字');
    const stats = await getStatusStats(page);
    expect(stats.pending).toBeGreaterThanOrEqual(5);
    
    // 3. 測試篩選
    console.log('\n3️⃣ 測試各種篩選');
    await filterByStatus(page, 'all');
    await page.waitForTimeout(500);
    await filterByStatus(page, 'pending');
    await page.waitForTimeout(500);
    
    // 4. 批次編輯（編輯第一個）
    console.log('\n4️⃣ 編輯第一個需求');
    await editRequest(page, requests[0].contact_name, {
      priority: 'urgent'
    });
    
    // 5. 批次刪除
    console.log('\n5️⃣ 批次刪除所有需求');
    for (const req of requests) {
      await deleteRequest(page, req.contact_name, true);
      await page.waitForTimeout(800);
    }
    
    await page.screenshot({ 
      path: 'test-results/screenshots/request-batch-complete.png',
      fullPage: true 
    });
    
    console.log('✅ 測試通過：批次操作流程執行成功');
  });

  test('E2E3: 多種類型需求混合測試', async ({ page }) => {
    console.log('\n🔄 測試：多種類型需求混合');
    
    // 建立不同類型的需求
    const types = ['志工', '物資', '志工+物資'];
    const priorities = ['urgent', 'high', 'normal', 'low'];
    
    console.log('\n1️⃣ 建立不同類型和優先順序的需求');
    for (let i = 0; i < 3; i++) {
      const requestData = generateTestRequest(`測試需求_混合_${i}`);
      requestData.request_type = types[i];
      requestData.priority = priorities[i];
      requestData.required_volunteers = (i + 1) * 2;
      
      await createRequest(page, requestData);
      console.log(`✓ 建立 ${types[i]} 需求，優先順序：${priorities[i]}，人數：${(i + 1) * 2}`);
    }
    
    // 驗證所有需求
    console.log('\n2️⃣ 驗證所有需求都存在');
    await filterByStatus(page, 'all');
    await page.waitForTimeout(1000);
    
    for (let i = 0; i < 3; i++) {
      const contactName = `測試需求_混合_${i}`;
      const exists = await page.locator(`div:has-text("${contactName}")`).count() > 0;
      expect(exists).toBe(true);
      console.log(`✓ 找到需求：${contactName}`);
    }
    
    await page.screenshot({ 
      path: 'test-results/screenshots/request-mixed-types.png',
      fullPage: true 
    });
    
    console.log('✅ 測試通過：多種類型需求混合測試成功');
  });

  // ==================== UI/UX 測試 ====================
  
  test('UI1: 表單應該正確顯示和關閉', async ({ page }) => {
    console.log('\n🎨 測試：表單顯示和關閉');
    
    // 開啟表單
    await page.click('button:has-text("新增需求")');
    await page.waitForTimeout(500);
    
    // 驗證表單顯示
    const formVisible = await page.locator('h3:has-text("新增需求")').isVisible();
    expect(formVisible).toBe(true);
    
    // 關閉表單
    await page.click('button:has(svg)').first(); // X 按鈕
    await page.waitForTimeout(500);
    
    // 驗證表單關閉
    const formClosed = await page.locator('h3:has-text("新增需求")').isVisible();
    expect(formClosed).toBe(false);
    
    console.log('✅ 測試通過：表單顯示和關閉正常');
  });

  test('UI2: 編輯表單應該預填資料', async ({ page }) => {
    console.log('\n🎨 測試：編輯表單預填資料');
    
    // 建立需求
    const requestData = generateTestRequest('測試需求_預填');
    const result = await createRequest(page, requestData);
    
    // 開啟編輯表單
    const requestCard = page.locator(`div:has-text("${result.contact_name}")`).first();
    await requestCard.locator('button:has-text("編輯")').click();
    await page.waitForTimeout(500);
    
    // 驗證欄位預填
    const villageInput = page.locator('input[placeholder*="東富村"]');
    const villageValue = await villageInput.inputValue();
    expect(villageValue).toBe(result.village);
    
    const streetInput = page.locator('input[placeholder*="佛祖街"]');
    const streetValue = await streetInput.inputValue();
    expect(streetValue).toBe(result.street);
    
    const nameInput = page.locator('input[placeholder*="聯絡人姓名"]');
    const nameValue = await nameInput.inputValue();
    expect(nameValue).toBe(result.contact_name);
    
    console.log('✅ 測試通過：編輯表單預填資料正常');
  });

  test('UI3: 刪除確認對話框應該正確顯示', async ({ page }) => {
    console.log('\n🎨 測試：刪除確認對話框');
    
    const requestData = generateTestRequest('測試需求_對話框');
    const result = await createRequest(page, requestData);
    
    // 設定對話框監聽
    let dialogShown = false;
    page.once('dialog', async dialog => {
      dialogShown = true;
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('確定');
      await dialog.dismiss();
    });
    
    // 點擊刪除
    const requestCard = page.locator(`div:has-text("${result.contact_name}")`).first();
    await requestCard.locator('button:has-text("刪除")').click();
    await page.waitForTimeout(500);
    
    expect(dialogShown).toBe(true);
    
    console.log('✅ 測試通過：刪除確認對話框顯示正常');
  });

});
