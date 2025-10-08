// e2e/admin/request-crud-simple.spec.js

import { test, expect } from '@playwright/test';
import {
  generateTestRequest,
  createRequest,
  editRequest,
  deleteRequest,
  requestExists,
  requestNotExists,
  createMultipleRequests,
  cleanupTestRequests,
  verifyRequestDetails
} from '../helpers/request-helpers.js';

/**
 * 需求管理簡化測試套件
 * 使用輔助函數的精簡版本測試
 */

test.describe('需求管理 - 簡化測試', () => {
  
  test.beforeEach(async ({ page }) => {
    // 導航並切換到需求管理
    await page.goto('http://localhost:5173/superman/admin');
    await page.click('button:has-text("需求管理")');
    await page.waitForTimeout(1000);
    
    console.log('✓ 已進入需求管理頁面');
  });

  test.afterEach(async ({ page }) => {
    // 清理測試資料
    await cleanupTestRequests(page, '測試需求');
  });

  // ==================== 基本 CRUD ====================
  
  test('應該可以新增需求', async ({ page }) => {
    const result = await createRequest(page);
    expect(await requestExists(page, result.contact_name)).toBe(true);
  });

  test('應該可以編輯需求', async ({ page }) => {
    const result = await createRequest(page);
    
    await editRequest(page, result.contact_name, {
      priority: 'urgent',
      description: '更新的描述'
    });
    
    const verified = await verifyRequestDetails(page, result.contact_name, {
      description: '更新的描述'
    });
    expect(verified).toBe(true);
  });

  test('應該可以刪除需求', async ({ page }) => {
    const result = await createRequest(page);
    
    await deleteRequest(page, result.contact_name, true);
    await page.waitForTimeout(1500);
    
    expect(await requestNotExists(page, result.contact_name)).toBe(true);
  });

  // ==================== 不同類型需求 ====================
  
  test('應該可以新增志工需求', async ({ page }) => {
    const data = generateTestRequest('志工需求');
    data.request_type = '志工';
    
    const result = await createRequest(page, data);
    expect(await requestExists(page, result.contact_name)).toBe(true);
  });

  test('應該可以新增物資需求', async ({ page }) => {
    const data = generateTestRequest('物資需求');
    data.request_type = '物資';
    
    const result = await createRequest(page, data);
    expect(await requestExists(page, result.contact_name)).toBe(true);
  });

  test('應該可以新增混合需求', async ({ page }) => {
    const data = generateTestRequest('混合需求');
    data.request_type = '志工+物資';
    
    const result = await createRequest(page, data);
    expect(await requestExists(page, result.contact_name)).toBe(true);
  });

  // ==================== 批次操作 ====================
  
  test('應該可以批次建立需求', async ({ page }) => {
    const requests = await createMultipleRequests(page, 5);
    
    for (const req of requests) {
      expect(await requestExists(page, req.contact_name)).toBe(true);
    }
  });

  test('應該可以批次刪除需求', async ({ page }) => {
    const requests = await createMultipleRequests(page, 3);
    
    for (const req of requests) {
      await deleteRequest(page, req.contact_name, true);
      await page.waitForTimeout(1000);
    }
    
    for (const req of requests) {
      expect(await requestNotExists(page, req.contact_name)).toBe(true);
    }
  });

  // ==================== 完整流程 ====================
  
  test('完整 CRUD 流程', async ({ page }) => {
    // Create
    const result = await createRequest(page);
    expect(await requestExists(page, result.contact_name)).toBe(true);
    
    // Update
    await editRequest(page, result.contact_name, {
      priority: 'urgent',
      required_volunteers: 10
    });
    
    // Read & Verify
    const requestCard = page.locator(`div:has-text("${result.contact_name}")`).first();
    const cardText = await requestCard.textContent();
    expect(cardText).toContain('10');
    
    // Delete
    await deleteRequest(page, result.contact_name, true);
    await page.waitForTimeout(1500);
    expect(await requestNotExists(page, result.contact_name)).toBe(true);
  });

  // ==================== 驗證測試 ====================
  
  test('應該驗證必填欄位', async ({ page }) => {
    await page.click('button:has-text("新增需求")');
    await page.waitForTimeout(500);
    
    // 直接提交空表單
    await page.click('button:has-text("建立需求")');
    await page.waitForTimeout(500);
    
    // 表單應該還在（驗證失敗）
    const formVisible = await page.locator('h3:has-text("新增需求")').isVisible();
    expect(formVisible).toBe(true);
  });

  test('應該正確顯示需求詳細資訊', async ({ page }) => {
    const data = generateTestRequest('詳細資訊測試');
    const result = await createRequest(page, data);
    
    const requestCard = page.locator(`div:has-text("${result.contact_name}")`).first();
    const cardText = await requestCard.textContent();
    
    expect(cardText).toContain(result.village);
    expect(cardText).toContain(result.street);
    expect(cardText).toContain(result.contact_name);
    expect(cardText).toContain(result.contact_phone);
  });

  // ==================== 優先順序測試 ====================
  
  test('應該可以建立緊急需求', async ({ page }) => {
    const data = generateTestRequest('緊急需求');
    data.priority = 'urgent';
    
    const result = await createRequest(page, data);
    
    const requestCard = page.locator(`div:has-text("${result.contact_name}")`).first();
    const cardText = await requestCard.textContent();
    expect(cardText).toContain('緊急');
  });

  test('應該可以建立高優先順序需求', async ({ page }) => {
    const data = generateTestRequest('高優先需求');
    data.priority = 'high';
    
    const result = await createRequest(page, data);
    
    const requestCard = page.locator(`div:has-text("${result.contact_name}")`).first();
    const cardText = await requestCard.textContent();
    expect(cardText).toContain('高');
  });

  test('應該可以更新優先順序', async ({ page }) => {
    const data = generateTestRequest('更新優先順序');
    data.priority = 'normal';
    
    const result = await createRequest(page, data);
    
    await editRequest(page, result.contact_name, {
      priority: 'urgent'
    });
    
    const requestCard = page.locator(`div:has-text("${result.contact_name}")`).first();
    const cardText = await requestCard.textContent();
    expect(cardText).toContain('緊急');
  });

  // ==================== 人數測試 ====================
  
  test('應該可以設定需要的志工人數', async ({ page }) => {
    const data = generateTestRequest('人數測試');
    data.required_volunteers = 5;
    
    const result = await createRequest(page, data);
    
    const requestCard = page.locator(`div:has-text("${result.contact_name}")`).first();
    const cardText = await requestCard.textContent();
    expect(cardText).toContain('5');
  });

  test('應該可以更新需要的志工人數', async ({ page }) => {
    const data = generateTestRequest('更新人數');
    data.required_volunteers = 3;
    
    const result = await createRequest(page, data);
    
    await editRequest(page, result.contact_name, {
      required_volunteers: 10
    });
    
    const requestCard = page.locator(`div:has-text("${result.contact_name}")`).first();
    const cardText = await requestCard.textContent();
    expect(cardText).toContain('10');
  });

  // ==================== 地點資訊測試 ====================
  
  test('應該可以更新地點資訊', async ({ page }) => {
    const result = await createRequest(page);
    
    const newVillage = '更新村';
    const newStreet = '更新街123號';
    
    await editRequest(page, result.contact_name, {
      village: newVillage,
      street: newStreet
    });
    
    const verified = await verifyRequestDetails(page, result.contact_name, {
      village: newVillage,
      street: newStreet
    });
    expect(verified).toBe(true);
  });

  // ==================== 聯絡資訊測試 ====================
  
  test('應該可以更新聯絡資訊', async ({ page }) => {
    const result = await createRequest(page);
    
    const newName = `更新_${result.contact_name}`;
    const newPhone = '0987654321';
    
    await editRequest(page, result.contact_name, {
      contact_name: newName,
      contact_phone: newPhone
    });
    
    expect(await requestExists(page, newName)).toBe(true);
    
    const verified = await verifyRequestDetails(page, newName, {
      contact_phone: newPhone
    });
    expect(verified).toBe(true);
  });

  // ==================== 混合場景測試 ====================
  
  test('應該可以建立並編輯多個不同類型的需求', async ({ page }) => {
    // 建立 3 種不同類型
    const types = ['志工', '物資', '志工+物資'];
    const requests = [];
    
    for (let i = 0; i < types.length; i++) {
      const data = generateTestRequest(`混合_${types[i]}`);
      data.request_type = types[i];
      const result = await createRequest(page, data);
      requests.push(result);
    }
    
    // 編輯每個需求
    for (const req of requests) {
      await editRequest(page, req.contact_name, {
        priority: 'urgent'
      });
    }
    
    // 驗證
    for (const req of requests) {
      const requestCard = page.locator(`div:has-text("${req.contact_name}")`).first();
      const cardText = await requestCard.textContent();
      expect(cardText).toContain('緊急');
    }
  });

  test('應該可以處理大量需求', async ({ page }) => {
    const count = 10;
    const requests = await createMultipleRequests(page, count);
    
    // 驗證所有需求都存在
    for (const req of requests) {
      expect(await requestExists(page, req.contact_name)).toBe(true);
    }
    
    // 編輯幾個
    for (let i = 0; i < 3; i++) {
      await editRequest(page, requests[i].contact_name, {
        priority: 'urgent'
      });
    }
    
    // 刪除幾個
    for (let i = 0; i < 3; i++) {
      await deleteRequest(page, requests[i].contact_name, true);
      await page.waitForTimeout(800);
    }
    
    // 驗證部分刪除
    for (let i = 0; i < 3; i++) {
      expect(await requestNotExists(page, requests[i].contact_name)).toBe(true);
    }
    
    // 驗證剩餘存在
    for (let i = 3; i < count; i++) {
      expect(await requestExists(page, requests[i].contact_name)).toBe(true);
    }
  });

});
