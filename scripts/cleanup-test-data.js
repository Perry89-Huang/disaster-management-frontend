// scripts/cleanup-test-data.js
import { chromium } from '@playwright/test';

async function cleanup() {
  console.log('\n🧹 開始清理測試資料...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('📍 導航到管理員頁面...');
    await page.goto('http://localhost:5173/admin');
    await page.waitForLoadState('networkidle');
    
    // 清理志工測試資料
    console.log('\n👥 清理志工測試資料...');
    await page.click('button:has-text("志工管理")');
    await page.waitForTimeout(1000);
    
    let volunteerCount = 0;
    let maxAttempts = 50;
    
    while (maxAttempts > 0) {
      const testVolunteers = page.locator('tr').filter({ hasText: /測試志工/ });
      const count = await testVolunteers.count();
      
      if (count === 0) break;
      
      const firstVolunteer = testVolunteers.first();
      const volunteerName = await firstVolunteer.locator('td').first().textContent();
      
      await firstVolunteer.locator('button:has-text("刪除")').click();
      page.once('dialog', dialog => dialog.accept());
      await page.waitForTimeout(1000);
      
      volunteerCount++;
      console.log(`  ✓ 已刪除: ${volunteerName}`);
      maxAttempts--;
    }
    
    console.log(`\n✅ 志工測試資料清理完成: 共刪除 ${volunteerCount} 筆`);
    
    // 清理需求測試資料
    console.log('\n📋 清理需求測試資料...');
    await page.click('button:has-text("需求管理")');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("全部")');
    await page.waitForTimeout(1000);
    
    let requestCount = 0;
    maxAttempts = 50;
    
    while (maxAttempts > 0) {
      const testRequests = page.locator('div').filter({ hasText: /測試需求/ });
      const count = await testRequests.count();
      
      if (count === 0) break;
      
            // 找到第一個測試需求
      const firstRequest = testRequests.first();
      const requestText = await firstRequest.textContent();
      
      // 點擊刪除按鈕
      await firstRequest.locator('button:has-text("刪除")').click();
      
      // 處理確認對話框
      page.once('dialog', dialog => dialog.accept());
      await page.waitForTimeout(1000);
      
      requestCount++;
      console.log(`  ✓ 已刪除: ${requestText.substring(0, 50)}...`);
      
      maxAttempts--;
    }
    
    console.log(`\n✅ 需求測試資料清理完成: 共刪除 ${requestCount} 筆`);
    
    // 清理派單測試資料
    console.log('\n📤 清理派單測試資料...');
    await page.click('button:has-text("派單管理")');
    await page.waitForTimeout(2000);
    
    const testAssignments = page.locator('div').filter({ hasText: /測試/ });
    const assignmentCount = await testAssignments.count();
    
    console.log(`  找到 ${assignmentCount} 筆派單資料`);
    console.log('  (派單會在需求或志工刪除時自動清理)');
    
    // 總結
    console.log('\n' + '='.repeat(60));
    console.log('📊 清理總結:');
    console.log(`  • 志工: ${volunteerCount} 筆`);
    console.log(`  • 需求: ${requestCount} 筆`);
    console.log(`  • 派單: ${assignmentCount} 筆（自動清理）`);
    console.log('='.repeat(60));
    
    console.log('\n✨ 測試資料清理完成！\n');
    
  } catch (error) {
    console.error('\n❌ 清理過程發生錯誤:', error.message);
    console.log('\n請確認：');
    console.log('  1. 開發伺服器正在運行 (npm run dev)');
    console.log('  2. 可以訪問 http://localhost:5173');
    console.log('  3. Hasura 服務正常運行');
  } finally {
    await browser.close();
  }
}

cleanup().catch(console.error);

