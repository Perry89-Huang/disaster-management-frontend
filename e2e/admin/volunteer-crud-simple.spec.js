import { test, expect } from '@playwright/test';
import {
  goToVolunteerManagement,
  generateTestVolunteer,
  createVolunteer,
  editVolunteer,
  deleteVolunteer,
  volunteerExists,
  volunteerNotExists,
  createMultipleVolunteers,
  cleanupTestVolunteers
} from '../helpers/volunteer-helpers.js';

/**
 * 志工管理 CRUD - 簡化版測試
 * 使用輔助函數讓測試更簡潔易讀
 */
test.describe('志工管理 CRUD - 簡化版', () => {
  
  test.beforeEach(async ({ page }) => {
    // 清除所有對話框監聽器
    page.removeAllListeners('dialog');
    
    await goToVolunteerManagement(page);
  });
  
  // 每個測試後清除監聽器
  test.afterEach(async ({ page }) => {
    page.removeAllListeners('dialog');
  });

  /**
   * 測試 1：快速新增志工
   */
  test('快速新增志工', async ({ page }) => {
    const result = await createVolunteer(page);
    
    expect(result.message).toContain('新增成功');
    expect(await volunteerExists(page, result.data.name)).toBe(true);
    
    console.log(`✅ 成功建立志工: ${result.data.name}`);
  });

  /**
   * 測試 2：使用自訂資料新增志工
   */
  test('使用自訂資料新增志工', async ({ page }) => {
    const timestamp = Date.now();
    const customData = {
      name: `王小明_${timestamp}`,
      phone: `0912${timestamp.toString().slice(-6)}`,
      nickname: '小明',
      memberCount: 2,
      notes: '熱心志工'
    };
    
    const result = await createVolunteer(page, customData);
    
    expect(result.message).toContain('新增成功');
    expect(await volunteerExists(page, customData.name)).toBe(true);
    
    console.log('✅ 成功建立自訂志工');
  });

  /**
   * 測試 3：快速編輯志工
   */
  test('快速編輯志工', async ({ page }) => {
    // 先建立
    const created = await createVolunteer(page);
    console.log(`✓ 建立志工: ${created.data.name}`);
    
    // 再編輯
    const updatedData = {
      name: `${created.data.name}_已更新`,
      notes: '已編輯的備註'
    };
    
    const message = await editVolunteer(page, created.data.name, updatedData);
    
    expect(message).toContain('更新成功');
    expect(await volunteerExists(page, updatedData.name)).toBe(true);
    
    console.log('✅ 成功編輯志工');
  });

  /**
   * 測試 4：快速刪除志工（確認刪除）
   */
  test('快速刪除志工 - 確認', async ({ page }) => {
    // 建立
    const created = await createVolunteer(page);
    console.log(`✓ 建立志工: ${created.data.name}`);
    
    // 刪除（確認）
    const message = await deleteVolunteer(page, created.data.name, true);
    
    expect(message).toContain('確定要刪除此志工嗎');
    expect(await volunteerNotExists(page, created.data.name)).toBe(true);
    
    console.log('✅ 成功刪除志工');
  });

  /**
   * 測試 5：快速刪除志工（取消刪除）
   */
  test('快速刪除志工 - 取消', async ({ page }) => {
    // 建立
    const created = await createVolunteer(page);
    console.log(`✓ 建立志工: ${created.data.name}`);
    
    // 刪除（取消）
    await deleteVolunteer(page, created.data.name, false);
    
    expect(await volunteerExists(page, created.data.name)).toBe(true);
    
    console.log('✅ 成功取消刪除');
  });

  /**
   * 測試 6：完整流程 - 建立→編輯→刪除
   */
  test('完整流程測試', async ({ page }) => {
    // 1. 建立
    console.log('📝 步驟 1: 建立志工');
    const created = await createVolunteer(page);
    expect(await volunteerExists(page, created.data.name)).toBe(true);
    console.log(`  ✓ 建立成功: ${created.data.name}`);
    
    // 等待確保志工在列表中
    await page.waitForTimeout(1000);
    
    // 2. 編輯
    console.log('✏️ 步驟 2: 編輯志工');
    const updatedName = `${created.data.name}_已編輯`;
    await editVolunteer(page, created.data.name, { name: updatedName });
    
    // 等待更新完成
    await page.waitForTimeout(1000);
    await page.waitForSelector(`text=${updatedName}`, {
      state: 'visible',
      timeout: 10000
    });
    
    expect(await volunteerExists(page, updatedName)).toBe(true);
    console.log(`  ✓ 編輯成功: ${updatedName}`);
    
    // 3. 刪除
    console.log('🗑️ 步驟 3: 刪除志工');
    await deleteVolunteer(page, updatedName, true);
    
    // 等待刪除完成
    await page.waitForTimeout(1000);
    expect(await volunteerNotExists(page, updatedName)).toBe(true);
    console.log('  ✓ 刪除成功');
    
    console.log('✅ 完整流程測試成功');
  });

  /**
   * 測試 7：批次建立志工
   */
  test('批次建立多個志工', async ({ page }) => {
    console.log('📦 批次建立 3 個志工...');
    
    const volunteers = await createMultipleVolunteers(page, 3);
    
    // 等待所有志工都出現
    await page.waitForTimeout(2000);
    
    // 驗證所有志工都建立成功
    for (const vol of volunteers) {
      const exists = await volunteerExists(page, vol.name);
      expect(exists).toBe(true);
    }
    
    console.log('✅ 批次建立成功');
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/screenshots/batch-volunteers.png',
      fullPage: true 
    });
  });

  /**
   * 測試 8：資料驗證
   */
  test('驗證必填欄位', async ({ page }) => {
    await page.click('button:has-text("新增志工")');
    await page.waitForTimeout(300);
    
    // 不填任何資料直接提交
    await page.click('button:has-text("儲存")');
    await page.waitForTimeout(500);
    
    // HTML5 驗證會阻止表單提交，表單應該仍然可見
    const formVisible = await page.locator('h3:has-text("新增志工")').isVisible();
    expect(formVisible).toBe(true);
    
    console.log('✅ 必填欄位驗證正常');
  });
});

/**
 * 清理測試（可選）
 * 在所有測試結束後清理測試資料
 */
test.describe('測試資料清理', () => {
  test.skip('清理所有測試志工', async ({ page }) => {
    await goToVolunteerManagement(page);
    
    // 清理包含"測試"的所有志工
    await cleanupTestVolunteers(page, '測試');
    
    // 也可以清理其他測試資料
    await cleanupTestVolunteers(page, '批次');
    await cleanupTestVolunteers(page, '王小明');
    
    console.log('✅ 所有測試資料已清理');
  });
});