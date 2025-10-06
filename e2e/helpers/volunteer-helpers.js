/**
 * 志工管理測試輔助函數
 * 提供常用的測試操作和資料產生器
 */

/**
 * 等待頁面就緒（不使用 networkidle）
 */
export async function waitForPageReady(page, selector, timeout = 15000) {
  try {
    await page.waitForSelector(selector, { 
      state: 'visible',
      timeout 
    });
    // 額外等待一下，確保 JavaScript 執行完成
    await page.waitForTimeout(500);
    return true;
  } catch (error) {
    console.error(`等待元素失敗: ${selector}`, error.message);
    return false;
  }
}

/**
 * 產生唯一的測試志工資料
 */
export function generateTestVolunteer(prefix = '測試志工') {
  const timestamp = Date.now();
  return {
    name: `${prefix}_${timestamp}`,
    phone: `0987${timestamp.toString().slice(-6)}`,
    nickname: `${prefix}暱稱`,
    memberCount: Math.floor(Math.random() * 5) + 1, // 1-5 人
    notes: `自動化測試資料 - ${new Date().toLocaleString('zh-TW')}`
  };
}

/**
 * 導航到志工管理頁面
 */
export async function goToVolunteerManagement(page) {
  // 清除舊的監聽器
  page.removeAllListeners('dialog');
  
  // 導航到頁面
  await page.goto('/admin', { waitUntil: 'domcontentloaded' });
  
  // 等待關鍵元素出現
  await waitForPageReady(page, 'h1:has-text("花蓮縣光復救災資源管理系統")');
  
  // 點擊志工管理
  await page.click('button:has-text("志工管理")');
  
  // 等待志工管理頁面載入
  await waitForPageReady(page, 'h2:has-text("志工管理")');
  
  // 額外等待，確保表格載入
  await page.waitForTimeout(1000);
}

/**
 * 開啟新增志工表單
 */
export async function openCreateForm(page) {
  await page.click('button:has-text("新增志工")');
  await page.waitForTimeout(300);
  await page.locator('h3:has-text("新增志工")').waitFor({ state: 'visible' });
}

/**
 * 填寫志工表單
 */
export async function fillVolunteerForm(page, data) {
  if (data.name) {
    await page.fill('input[placeholder="請輸入姓名"]', data.name);
  }
  if (data.phone) {
    await page.fill('input[placeholder="0912-345-678"]', data.phone);
  }
  if (data.nickname) {
    await page.fill('input[placeholder="選填"]', data.nickname);
  }
  if (data.memberCount) {
    await page.fill('input[type="number"]', data.memberCount.toString());
  }
  if (data.notes) {
    await page.fill('textarea[placeholder*="其他備註"]', data.notes);
  }
}

/**
 * 提交表單並等待結果
 */
export async function submitForm(page, expectSuccess = true) {
  let dialogMessage = '';
  
  // 使用 once 只處理一次對話框
  page.once('dialog', async dialog => {
    dialogMessage = dialog.message();
    await dialog.accept();
  });
  
  await page.click('button:has-text("儲存")');
  await page.waitForTimeout(3000); // 增加等待時間
  
  if (expectSuccess) {
    return dialogMessage;
  }
}

/**
 * 完整的新增志工流程
 */
export async function createVolunteer(page, data = null) {
  const volunteerData = data || generateTestVolunteer();
  
  await openCreateForm(page);
  await fillVolunteerForm(page, volunteerData);
  
  // 等待新志工出現在列表中
  let dialogMessage = '';
  page.once('dialog', async dialog => {
    dialogMessage = dialog.message();
    await dialog.accept();
  });
  
  await page.click('button:has-text("儲存")');
  await page.waitForTimeout(3000);
  
  // 等待志工出現在列表
  await page.waitForSelector(`text=${volunteerData.name}`, {
    state: 'visible',
    timeout: 10000
  }).catch(() => {
    console.warn(`Warning: Volunteer ${volunteerData.name} not found in list`);
  });
  
  return { data: volunteerData, message: dialogMessage };
}

/**
 * 找到指定志工的行
 */
export async function findVolunteerRow(page, nameOrPhone) {
  const row = page.locator(`tr:has-text("${nameOrPhone}")`);
  await row.waitFor({ state: 'visible', timeout: 5000 });
  return row;
}

/**
 * 編輯志工
 */
export async function editVolunteer(page, searchText, newData) {
  // 等待志工出現
  await page.waitForSelector(`text=${searchText}`, {
    state: 'visible',
    timeout: 10000
  });
  
  const row = page.locator(`tr:has-text("${searchText}")`);
  await row.waitFor({ state: 'visible', timeout: 5000 });
  
  await row.locator('button:has-text("編輯")').click();
  await page.waitForTimeout(500);
  
  await page.locator('h3:has-text("編輯志工")').waitFor({ state: 'visible' });
  
  await fillVolunteerForm(page, newData);
  
  // 處理對話框
  let message = '';
  page.once('dialog', async dialog => {
    message = dialog.message();
    await dialog.accept();
  });
  
  await page.click('button:has-text("儲存")');
  await page.waitForTimeout(3000);
  
  return message;
}

/**
 * 刪除志工
 */
export async function deleteVolunteer(page, nameOrPhone, confirm = true) {
  // 等待志工出現
  await page.waitForSelector(`text=${nameOrPhone}`, {
    state: 'visible',
    timeout: 10000
  });
  
  const row = page.locator(`tr:has-text("${nameOrPhone}")`);
  await row.waitFor({ state: 'visible', timeout: 5000 });
  
  const deleteButton = row.locator('button:has-text("刪除")');
  
  let dialogMessage = '';
  
  if (confirm) {
    // 確認刪除：需要處理兩個對話框
    page.once('dialog', async dialog => {
      dialogMessage = dialog.message();
      await dialog.accept(); // 確認刪除
      
      // 處理成功訊息
      page.once('dialog', async successDialog => {
        await successDialog.accept();
      });
    });
  } else {
    // 取消刪除：只有一個對話框
    page.once('dialog', async dialog => {
      dialogMessage = dialog.message();
      await dialog.dismiss(); // 取消
    });
  }
  
  await deleteButton.click();
  await page.waitForTimeout(3000);
  
  return dialogMessage;
}

/**
 * 驗證志工是否存在於列表中
 */
export async function volunteerExists(page, nameOrPhone) {
  try {
    await page.locator(`text=${nameOrPhone}`).waitFor({ 
      state: 'visible', 
      timeout: 3000 
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * 驗證志工不存在於列表中
 */
export async function volunteerNotExists(page, nameOrPhone) {
  try {
    await page.locator(`text=${nameOrPhone}`).waitFor({ 
      state: 'hidden', 
      timeout: 3000 
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * 取得志工列表數量
 */
export async function getVolunteerCount(page) {
  const rows = page.locator('tbody tr');
  return await rows.count();
}

/**
 * 驗證表單欄位預填值
 */
export async function verifyFormValues(page, expectedData) {
  const results = {};
  
  if (expectedData.name) {
    const nameValue = await page.inputValue('input[placeholder="請輸入姓名"]');
    results.name = nameValue === expectedData.name;
  }
  
  if (expectedData.phone) {
    const phoneValue = await page.inputValue('input[placeholder="0912-345-678"]');
    results.phone = phoneValue === expectedData.phone;
  }
  
  if (expectedData.nickname) {
    const nicknameValue = await page.inputValue('input[placeholder="選填"]');
    results.nickname = nicknameValue === expectedData.nickname;
  }
  
  if (expectedData.memberCount) {
    const countValue = await page.inputValue('input[type="number"]');
    results.memberCount = countValue === expectedData.memberCount.toString();
  }
  
  if (expectedData.notes) {
    const notesValue = await page.inputValue('textarea[placeholder*="其他備註"]');
    results.notes = notesValue === expectedData.notes;
  }
  
  return results;
}

/**
 * 批次建立多個測試志工
 */
export async function createMultipleVolunteers(page, count = 3) {
  const volunteers = [];
  
  for (let i = 0; i < count; i++) {
    const data = generateTestVolunteer(`批次測試${i + 1}`);
    
    // 開啟表單
    await openCreateForm(page);
    await fillVolunteerForm(page, data);
    
    // 處理對話框
    page.once('dialog', async dialog => {
      await dialog.accept();
    });
    
    await page.click('button:has-text("儲存")');
    await page.waitForTimeout(3000);
    
    // 等待志工出現
    await page.waitForSelector(`text=${data.name}`, {
      state: 'visible',
      timeout: 10000
    }).catch(() => {
      console.warn(`Warning: Volunteer ${data.name} not found`);
    });
    
    volunteers.push(data);
    console.log(`  ✓ 已建立志工 ${i + 1}/${count}: ${data.name}`);
  }
  
  return volunteers;
}

/**
 * 清理測試資料（刪除所有測試志工）
 */
export async function cleanupTestVolunteers(page, prefix = '測試') {
  const testVolunteers = page.locator(`tr:has-text("${prefix}")`);
  const count = await testVolunteers.count();
  
  console.log(`  🧹 找到 ${count} 個測試志工，準備清理...`);
  
  for (let i = 0; i < count; i++) {
    try {
      const row = testVolunteers.nth(0); // 總是刪除第一個，因為刪除後列表會更新
      const deleteButton = row.locator('button:has-text("刪除")');
      
      // 處理兩個對話框
      page.once('dialog', async dialog => {
        await dialog.accept(); // 確認刪除
        
        page.once('dialog', async successDialog => {
          await successDialog.accept(); // 成功訊息
        });
      });
      
      await deleteButton.click();
      await page.waitForTimeout(2000);
      
      console.log(`  ✓ 已清理 ${i + 1}/${count}`);
    } catch (error) {
      console.log(`  ⚠️ 清理第 ${i + 1} 個志工時發生錯誤: ${error.message}`);
    }
  }
  
  console.log('  ✅ 測試資料清理完成');
}