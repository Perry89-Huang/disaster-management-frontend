import { test, expect } from '@playwright/test';

/**
 * 志工管理 CRUD 測試
 * 測試管理員對志工的完整管理功能
 */
test.describe('志工管理 CRUD', () => {
  
  // 每個測試前都導航到管理員頁面並切換到志工管理
  test.beforeEach(async ({ page }) => {
    console.log('📋 準備測試環境...');
    
    // 清除所有舊的對話框監聽器
    page.removeAllListeners('dialog');
    
    // 1. 導航到管理員頁面
    await page.goto('/admin');
    
    // 2. 等待關鍵元素而非 networkidle（因為有 polling）
    await page.waitForSelector('h1:has-text("花蓮縣光復救災資源管理系統")', { 
      state: 'visible',
      timeout: 15000 
    });
    
    // 3. 切換到志工管理頁籤
    await page.click('button:has-text("志工管理")');
    await page.waitForTimeout(1000);
    
    // 4. 驗證頁面載入成功
    await expect(page.locator('h2:has-text("志工管理")')).toBeVisible({ timeout: 10000 });
    console.log('✓ 已進入志工管理頁面');
  });

  /**
   * 測試 1：查看志工列表 (Read)
   */
  test('應該顯示志工列表', async ({ page }) => {
    console.log('🔍 測試：查看志工列表');
    
    // 驗證頁面標題
    await expect(page.locator('h2:has-text("志工管理")')).toBeVisible();
    
    // 驗證新增志工按鈕存在
    const addButton = page.locator('button:has-text("新增志工")');
    await expect(addButton).toBeVisible();
    console.log('  ✓ 新增志工按鈕存在');
    
    // 驗證表格 header 存在
    await expect(page.locator('th:has-text("姓名")')).toBeVisible();
    await expect(page.locator('th:has-text("電話")')).toBeVisible();
    await expect(page.locator('th:has-text("人數")')).toBeVisible();
    await expect(page.locator('th:has-text("狀態")')).toBeVisible();
    await expect(page.locator('th:has-text("操作")')).toBeVisible();
    console.log('  ✓ 表格標題正確');
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/screenshots/volunteer-list.png',
      fullPage: true 
    });
    
    console.log('✅ 志工列表顯示正常');
  });

  /**
   * 測試 2：開啟新增志工表單
   */
  test('應該可以開啟新增志工表單', async ({ page }) => {
    console.log('🔍 測試：開啟新增志工表單');
    
    // 點擊新增志工按鈕
    await page.click('button:has-text("新增志工")');
    await page.waitForTimeout(300);
    
    // 驗證表單標題
    await expect(page.locator('h3:has-text("新增志工")')).toBeVisible();
    console.log('  ✓ 表單標題正確');
    
    // 驗證所有必填欄位存在
    await expect(page.locator('label:has-text("姓名")')).toBeVisible();
    await expect(page.locator('label:has-text("電話")')).toBeVisible();
    console.log('  ✓ 必填欄位存在');
    
    // 驗證選填欄位存在
    await expect(page.locator('label:has-text("暱稱")')).toBeVisible();
    await expect(page.locator('label:has-text("人數")')).toBeVisible();
    await expect(page.locator('label:has-text("附註")')).toBeVisible();
    console.log('  ✓ 選填欄位存在');
    
    // 驗證操作按鈕
    await expect(page.locator('button:has-text("取消")')).toBeVisible();
    await expect(page.locator('button:has-text("儲存")')).toBeVisible();
    console.log('  ✓ 操作按鈕存在');
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/screenshots/volunteer-create-form.png',
      fullPage: true 
    });
    
    console.log('✅ 新增志工表單正常');
  });

  /**
   * 測試 3：關閉表單
   */
  test('應該可以關閉新增志工表單', async ({ page }) => {
    console.log('🔍 測試：關閉表單');
    
    // 開啟表單
    await page.click('button:has-text("新增志工")');
    await page.waitForTimeout(300);
    
    // 方式 1: 點擊取消按鈕
    await page.click('button:has-text("取消")');
    await page.waitForTimeout(300);
    
    // 驗證表單已關閉
    await expect(page.locator('h3:has-text("新增志工")')).not.toBeVisible();
    console.log('  ✓ 點擊取消按鈕可關閉表單');
    
    // 重新開啟表單
    await page.click('button:has-text("新增志工")');
    await page.waitForTimeout(300);
    
    // 方式 2: 點擊 X 按鈕
    const closeButton = page.locator('button:has(svg)').filter({ hasText: '' }).first();
    await closeButton.click();
    await page.waitForTimeout(300);
    
    // 驗證表單已關閉
    await expect(page.locator('h3:has-text("新增志工")')).not.toBeVisible();
    console.log('  ✓ 點擊 X 按鈕可關閉表單');
    
    console.log('✅ 表單關閉功能正常');
  });

  /**
   * 測試 4：新增志工 - 表單驗證（必填欄位）
   */
  test('新增志工時應該驗證必填欄位', async ({ page }) => {
    console.log('🔍 測試：表單驗證');
    
    // 開啟表單
    await page.click('button:has-text("新增志工")');
    await page.waitForTimeout(300);
    
    // 監聽 alert 對話框
    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      console.log(`  ℹ️  Alert: ${alertMessage}`);
      await dialog.accept();
    });
    
    // 不填寫任何欄位，直接點擊儲存
    await page.click('button:has-text("儲存")');
    await page.waitForTimeout(500);
    
    // 驗證是否有錯誤提示（可能是 alert 或表單驗證）
    // HTML5 required 屬性會阻止提交，所以表單不會關閉
    const formStillVisible = await page.locator('h3:has-text("新增志工")').isVisible();
    expect(formStillVisible).toBe(true);
    console.log('  ✓ 空白表單無法提交');
    
    console.log('✅ 表單驗證正常');
  });

  /**
   * 測試 5：新增志工成功 (Create)
   */
  test('應該可以成功新增志工', async ({ page }) => {
    console.log('🔍 測試：新增志工');
    
    // 產生唯一的測試資料（避免重複）
    const timestamp = Date.now();
    const testData = {
      name: `測試志工_${timestamp}`,
      phone: `0987${timestamp.toString().slice(-6)}`,
      nickname: '測試暱稱',
      memberCount: '3',
      notes: '這是自動化測試建立的志工資料'
    };
    
    console.log(`  📝 測試資料: ${testData.name}, ${testData.phone}`);
    
    // 1. 開啟新增表單
    await page.click('button:has-text("新增志工")');
    await page.waitForTimeout(300);
    
    // 2. 填寫表單
    await page.fill('input[placeholder="請輸入姓名"]', testData.name);
    console.log('  ✓ 已填寫姓名');
    
    await page.fill('input[placeholder="0912-345-678"]', testData.phone);
    console.log('  ✓ 已填寫電話');
    
    await page.fill('input[placeholder="選填"]', testData.nickname);
    console.log('  ✓ 已填寫暱稱');
    
    await page.fill('input[type="number"]', testData.memberCount);
    console.log('  ✓ 已填寫人數');
    
    await page.fill('textarea[placeholder*="其他備註"]', testData.notes);
    console.log('  ✓ 已填寫附註');
    
    // 截圖（表單已填寫）
    await page.screenshot({ 
      path: 'test-results/screenshots/volunteer-form-filled.png',
      fullPage: true 
    });
    
    // 3. 設定對話框處理（使用 once 只處理一次）
    let alertMessage = '';
    page.once('dialog', async dialog => {
      alertMessage = dialog.message();
      console.log(`  💬 Alert: ${alertMessage}`);
      await dialog.accept();
    });
    
    // 4. 提交表單
    await page.click('button:has-text("儲存")');
    await page.waitForTimeout(3000); // 等待 API 回應
    
    // 5. 驗證成功訊息
    expect(alertMessage).toContain('新增成功');
    console.log('  ✓ 收到成功訊息');
    
    // 6. 驗證表單已關閉
    await expect(page.locator('h3:has-text("新增志工")')).not.toBeVisible();
    console.log('  ✓ 表單已關閉');
    
    // 7. 驗證新志工出現在列表中（等待表格更新）
    await page.waitForTimeout(1000);
    await expect(page.locator(`text=${testData.name}`)).toBeVisible();
    await expect(page.locator(`text=${testData.phone}`)).toBeVisible();
    console.log('  ✓ 新志工出現在列表中');
    
    // 8. 最終截圖
    await page.screenshot({ 
      path: 'test-results/screenshots/volunteer-created.png',
      fullPage: true 
    });
    
    console.log('✅ 新增志工成功');
  });

  /**
   * 測試 6：編輯志工 (Update)
   */
  test('應該可以編輯志工資料', async ({ page }) => {
    console.log('🔍 測試：編輯志工');
    
    // 1. 先新增一個測試志工
    const timestamp = Date.now();
    const originalData = {
      name: `編輯測試_${timestamp}`,
      phone: `0988${timestamp.toString().slice(-6)}`
    };
    
    await page.click('button:has-text("新增志工")');
    await page.waitForTimeout(500);
    await page.fill('input[placeholder="請輸入姓名"]', originalData.name);
    await page.fill('input[placeholder="0912-345-678"]', originalData.phone);
    
    // 處理新增成功的 alert
    page.once('dialog', async dialog => {
      console.log(`  💬 新增: ${dialog.message()}`);
      await dialog.accept();
    });
    
    await page.click('button:has-text("儲存")');
    await page.waitForTimeout(3000);
    
    console.log(`  ✓ 已建立測試志工: ${originalData.name}`);
    
    // 2. 等待志工出現在列表中（重要！）
    await page.waitForSelector(`text=${originalData.name}`, { 
      state: 'visible',
      timeout: 10000 
    });
    console.log('  ✓ 志工已出現在列表中');
    
    // 3. 找到剛建立的志工並點擊編輯
    const volunteerRow = page.locator(`tr:has-text("${originalData.name}")`);
    await expect(volunteerRow).toBeVisible({ timeout: 5000 });
    
    const editButton = volunteerRow.locator('button:has-text("編輯")');
    await editButton.click();
    await page.waitForTimeout(500);
    
    // 4. 驗證編輯表單已開啟並預填資料
    await expect(page.locator('h3:has-text("編輯志工")')).toBeVisible();
    console.log('  ✓ 編輯表單已開啟');
    
    const nameInput = page.locator('input[placeholder="請輸入姓名"]');
    expect(await nameInput.inputValue()).toBe(originalData.name);
    console.log('  ✓ 姓名已預填');
    
    const phoneInput = page.locator('input[placeholder="0912-345-678"]');
    expect(await phoneInput.inputValue()).toBe(originalData.phone);
    console.log('  ✓ 電話已預填');
    
    // 5. 修改資料
    const updatedData = {
      name: `${originalData.name}_已編輯`,
      nickname: '編輯後的暱稱',
      notes: '這是編輯後的備註'
    };
    
    await nameInput.fill(updatedData.name);
    await page.fill('input[placeholder="選填"]', updatedData.nickname);
    await page.fill('textarea[placeholder*="其他備註"]', updatedData.notes);
    console.log('  ✓ 已修改資料');
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/screenshots/volunteer-edit-form.png',
      fullPage: true 
    });
    
    // 6. 處理更新成功的 alert
    let alertMessage = '';
    page.once('dialog', async dialog => {
      alertMessage = dialog.message();
      console.log(`  💬 更新: ${alertMessage}`);
      await dialog.accept();
    });
    
    await page.click('button:has-text("儲存")');
    await page.waitForTimeout(3000);
    
    // 7. 驗證更新成功
    expect(alertMessage).toContain('更新成功');
    console.log('  ✓ 收到更新成功訊息');
    
    // 8. 驗證列表中顯示更新後的資料
    await page.waitForTimeout(1000);
    await expect(page.locator(`text=${updatedData.name}`)).toBeVisible();
    console.log('  ✓ 列表已更新');
    
    // 最終截圖
    await page.screenshot({ 
      path: 'test-results/screenshots/volunteer-updated.png',
      fullPage: true 
    });
    
    console.log('✅ 編輯志工成功');
  });

  /**
   * 測試 7：刪除志工 - 取消操作
   */
  test('應該可以取消刪除志工', async ({ page }) => {
    console.log('🔍 測試：取消刪除志工');
    
    // 1. 先建立一個測試志工
    const timestamp = Date.now();
    const testData = {
      name: `刪除測試_${timestamp}`,
      phone: `0989${timestamp.toString().slice(-6)}`
    };
    
    await page.click('button:has-text("新增志工")');
    await page.waitForTimeout(500);
    await page.fill('input[placeholder="請輸入姓名"]', testData.name);
    await page.fill('input[placeholder="0912-345-678"]', testData.phone);
    
    // 處理新增的 alert
    page.once('dialog', async dialog => {
      console.log(`  💬 新增: ${dialog.message()}`);
      await dialog.accept();
    });
    
    await page.click('button:has-text("儲存")');
    await page.waitForTimeout(3000);
    
    console.log(`  ✓ 已建立測試志工: ${testData.name}`);
    
    // 2. 等待志工出現在列表中
    await page.waitForSelector(`text=${testData.name}`, { 
      state: 'visible',
      timeout: 10000 
    });
    console.log('  ✓ 志工已出現在列表中');
    
    // 3. 找到刪除按鈕並點擊
    const volunteerRow = page.locator(`tr:has-text("${testData.name}")`);
    await expect(volunteerRow).toBeVisible({ timeout: 5000 });
    
    const deleteButton = volunteerRow.locator('button:has-text("刪除")');
    
    // 4. 處理刪除確認對話框（選擇取消）
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('確定要刪除此志工嗎');
      console.log('  ✓ 收到刪除確認對話框');
      await dialog.dismiss(); // 選擇取消
    });
    
    await deleteButton.click();
    await page.waitForTimeout(1000);
    
    // 5. 驗證志工仍然存在
    await expect(page.locator(`text=${testData.name}`)).toBeVisible();
    console.log('  ✓ 取消刪除，志工仍存在');
    
    console.log('✅ 取消刪除功能正常');
  });

  /**
   * 測試 8：刪除志工成功 (Delete)
   */
  test('應該可以成功刪除志工', async ({ page }) => {
    console.log('🔍 測試：刪除志工');
    
    // 1. 先建立一個要刪除的測試志工
    const timestamp = Date.now();
    const testData = {
      name: `待刪除_${timestamp}`,
      phone: `0990${timestamp.toString().slice(-6)}`
    };
    
    await page.click('button:has-text("新增志工")');
    await page.waitForTimeout(500);
    await page.fill('input[placeholder="請輸入姓名"]', testData.name);
    await page.fill('input[placeholder="0912-345-678"]', testData.phone);
    
    // 處理新增的 alert
    page.once('dialog', async dialog => {
      console.log(`  💬 新增: ${dialog.message()}`);
      await dialog.accept();
    });
    
    await page.click('button:has-text("儲存")');
    await page.waitForTimeout(3000);
    
    console.log(`  ✓ 已建立待刪除志工: ${testData.name}`);
    
    // 2. 等待志工出現在列表中
    await page.waitForSelector(`text=${testData.name}`, { 
      state: 'visible',
      timeout: 10000 
    });
    console.log('  ✓ 志工已出現在列表中');
    
    // 3. 點擊刪除按鈕
    const volunteerRow = page.locator(`tr:has-text("${testData.name}")`);
    await expect(volunteerRow).toBeVisible({ timeout: 5000 });
    
    const deleteButton = volunteerRow.locator('button:has-text("刪除")');
    
    // 4. 設定對話框處理器（會有兩個對話框）
    let confirmDialogShown = false;
    let successAlertShown = false;
    
    const handleDialog = async (dialog) => {
      const message = dialog.message();
      console.log(`  💬 對話框: ${message}`);
      
      if (message.includes('確定要刪除此志工嗎')) {
        confirmDialogShown = true;
        console.log('  ✓ 收到刪除確認對話框');
        await dialog.accept(); // 確認刪除
        
        // 第一個對話框處理後，等待第二個對話框
        page.once('dialog', async (successDialog) => {
          successAlertShown = true;
          console.log(`  💬 成功訊息: ${successDialog.message()}`);
          console.log('  ✓ 收到刪除成功訊息');
          await successDialog.accept();
        });
      }
    };
    
    page.once('dialog', handleDialog);
    
    await deleteButton.click();
    await page.waitForTimeout(3000);
    
    // 5. 驗證對話框都有顯示
    expect(confirmDialogShown).toBe(true);
    expect(successAlertShown).toBe(true);
    
    // 6. 驗證志工已從列表中移除
    await page.waitForTimeout(1000);
    await expect(page.locator(`text=${testData.name}`)).not.toBeVisible();
    console.log('  ✓ 志工已從列表中移除');
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/screenshots/volunteer-deleted.png',
      fullPage: true 
    });
    
    console.log('✅ 刪除志工成功');
  });

  /**
   * 測試 9：志工狀態顯示
   */
  test('應該正確顯示志工狀態', async ({ page }) => {
    console.log('🔍 測試：志工狀態顯示');
    
    // 驗證狀態標籤存在（至少有一個志工）
    const statusLabels = [
      { text: '離線', class: 'bg-gray-100' },
      { text: '已上線', class: 'bg-green-100' },
      { text: '派單中', class: 'bg-yellow-100' },
      { text: '執行中', class: 'bg-blue-100' }
    ];
    
    // 檢查表格中是否有任何狀態標籤
    const tableBody = page.locator('tbody');
    const hasVolunteers = await tableBody.locator('tr').count() > 0;
    
    if (hasVolunteers) {
      console.log('  ✓ 列表中有志工資料');
      
      // 至少應該要有一個狀態顯示
      let foundStatus = false;
      for (const status of statusLabels) {
        const statusElement = page.locator(`text=${status.text}`).first();
        if (await statusElement.isVisible()) {
          console.log(`  ✓ 找到狀態: ${status.text}`);
          foundStatus = true;
          break;
        }
      }
      
      expect(foundStatus).toBe(true);
    } else {
      console.log('  ℹ️  目前沒有志工資料');
    }
    
    console.log('✅ 狀態顯示測試完成');
  });

  /**
   * 測試 10：完整 CRUD 流程
   */
  test('完整測試 CRUD 流程', async ({ page }) => {
    console.log('🔍 測試：完整 CRUD 流程');
    
    const timestamp = Date.now();
    const volunteer = {
      name: `完整測試_${timestamp}`,
      phone: `0991${timestamp.toString().slice(-6)}`,
      nickname: 'CRUD測試',
      memberCount: '5',
      notes: '完整流程測試'
    };
    
    // === 1. CREATE ===
    console.log('  📝 步驟 1: 新增志工');
    await page.click('button:has-text("新增志工")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="請輸入姓名"]', volunteer.name);
    await page.fill('input[placeholder="0912-345-678"]', volunteer.phone);
    await page.fill('input[placeholder="選填"]', volunteer.nickname);
    await page.fill('input[type="number"]', volunteer.memberCount);
    await page.fill('textarea[placeholder*="其他備註"]', volunteer.notes);
    
    // 處理新增的 alert
    page.once('dialog', async dialog => {
      console.log(`  💬 CREATE: ${dialog.message()}`);
      await dialog.accept();
    });
    
    await page.click('button:has-text("儲存")');
    await page.waitForTimeout(3000);
    console.log('  ✅ CREATE 完成');
    
    // === 2. READ ===
    console.log('  📖 步驟 2: 讀取志工');
    
    // 等待志工出現
    await page.waitForSelector(`text=${volunteer.name}`, { 
      state: 'visible',
      timeout: 10000 
    });
    
    await expect(page.locator(`text=${volunteer.name}`)).toBeVisible();
    await expect(page.locator(`text=${volunteer.phone}`)).toBeVisible();
    console.log('  ✅ READ 完成');
    
    // === 3. UPDATE ===
    console.log('  ✏️ 步驟 3: 更新志工');
    
    const row = page.locator(`tr:has-text("${volunteer.name}")`);
    await expect(row).toBeVisible({ timeout: 5000 });
    
    await row.locator('button:has-text("編輯")').click();
    await page.waitForTimeout(500);
    
    const updatedName = `${volunteer.name}_更新`;
    await page.fill('input[placeholder="請輸入姓名"]', updatedName);
    
    // 處理更新的 alert
    page.once('dialog', async dialog => {
      console.log(`  💬 UPDATE: ${dialog.message()}`);
      await dialog.accept();
    });
    
    await page.click('button:has-text("儲存")');
    await page.waitForTimeout(3000);
    
    // 等待更新後的名稱出現
    await page.waitForSelector(`text=${updatedName}`, { 
      state: 'visible',
      timeout: 10000 
    });
    
    await expect(page.locator(`text=${updatedName}`)).toBeVisible();
    console.log('  ✅ UPDATE 完成');
    
    // === 4. DELETE ===
    console.log('  🗑️ 步驟 4: 刪除志工');
    
    const updatedRow = page.locator(`tr:has-text("${updatedName}")`);
    await expect(updatedRow).toBeVisible({ timeout: 5000 });
    
    // 處理刪除確認對話框
    page.once('dialog', async dialog => {
      console.log(`  💬 DELETE 確認: ${dialog.message()}`);
      await dialog.accept();
      
      // 處理刪除成功對話框
      page.once('dialog', async successDialog => {
        console.log(`  💬 DELETE 成功: ${successDialog.message()}`);
        await successDialog.accept();
      });
    });
    
    await updatedRow.locator('button:has-text("刪除")').click();
    await page.waitForTimeout(3000);
    
    await expect(page.locator(`text=${updatedName}`)).not.toBeVisible();
    console.log('  ✅ DELETE 完成');
    
    // 最終截圖
    await page.screenshot({ 
      path: 'test-results/screenshots/volunteer-crud-complete.png',
      fullPage: true 
    });
    
    console.log('✅ 完整 CRUD 流程測試成功');
  });
});