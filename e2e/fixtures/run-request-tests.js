// scripts/run-request-tests.js
/**
 * 需求管理測試執行腳本
 * 提供便捷的測試執行選項
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function showBanner() {
  console.clear();
  log('╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║       需求管理測試執行器 v1.0                         ║', 'cyan');
  log('║       Request Management Test Runner                   ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  console.log();
}

function showMenu() {
  log('請選擇測試類型:', 'bright');
  console.log();
  log('  1. 快速測試（簡化版，約 3-5 分鐘）', 'green');
  log('  2. 完整測試（全部測試，約 8-12 分鐘）', 'yellow');
  log('  3. 只測試 CREATE 功能', 'blue');
  log('  4. 只測試 UPDATE 功能', 'blue');
  log('  5. 只測試 DELETE 功能', 'blue');
  log('  6. 只測試篩選功能', 'blue');
  log('  7. 只測試完整流程', 'blue');
  log('  8. UI 模式（互動式）', 'cyan');
  log('  9. 除錯模式', 'cyan');
  log('  10. 產生測試報告', 'cyan');
  log('  0. 離開', 'red');
  console.log();
}

function runTest(command, description) {
  log(`\n開始執行: ${description}`, 'bright');
  log('━'.repeat(60), 'cyan');
  
  try {
    execSync(command, { stdio: 'inherit' });
    log('\n━'.repeat(60), 'cyan');
    log('✅ 測試完成！', 'green');
    
    // 詢問是否查看報告
    rl.question('\n是否查看測試報告？(y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        log('\n開啟測試報告...', 'cyan');
        execSync('npx playwright show-report', { stdio: 'inherit' });
      }
      showMenuAndPrompt();
    });
  } catch (error) {
    log('\n━'.repeat(60), 'cyan');
    log('❌ 測試失敗！', 'red');
    log('請檢查錯誤訊息並修正問題。', 'yellow');
    
    rl.question('\n按 Enter 繼續...', () => {
      showMenuAndPrompt();
    });
  }
}

function showMenuAndPrompt() {
  console.log('\n');
  showMenu();
  
  rl.question('請輸入選項 (0-10): ', (answer) => {
    const choice = answer.trim();
    
    switch (choice) {
      case '1':
        runTest(
          'npx playwright test e2e/admin/request-crud-simple.spec.js',
          '快速測試（簡化版）'
        );
        break;
        
      case '2':
        runTest(
          'npx playwright test e2e/admin/request-management.spec.js',
          '完整測試'
        );
        break;
        
      case '3':
        runTest(
          'npx playwright test e2e/admin/request-management.spec.js -g "CREATE"',
          'CREATE 功能測試'
        );
        break;
        
      case '4':
        runTest(
          'npx playwright test e2e/admin/request-management.spec.js -g "UPDATE"',
          'UPDATE 功能測試'
        );
        break;
        
      case '5':
        runTest(
          'npx playwright test e2e/admin/request-management.spec.js -g "DELETE"',
          'DELETE 功能測試'
        );
        break;
        
      case '6':
        runTest(
          'npx playwright test e2e/admin/request-management.spec.js -g "篩選"',
          '篩選功能測試'
        );
        break;
        
      case '7':
        runTest(
          'npx playwright test e2e/admin/request-management.spec.js -g "E2E"',
          '完整流程測試'
        );
        break;
        
      case '8':
        log('\n開啟 UI 模式...', 'cyan');
        try {
          execSync('npx playwright test e2e/admin/request-management.spec.js --ui', { stdio: 'inherit' });
        } catch (error) {
          log('UI 模式已關閉', 'yellow');
        }
        showMenuAndPrompt();
        break;
        
      case '9':
        log('\n開啟除錯模式...', 'cyan');
        log('提示: 使用工具列控制測試執行', 'yellow');
        try {
          execSync('npx playwright test e2e/admin/request-crud-simple.spec.js --debug', { stdio: 'inherit' });
        } catch (error) {
          log('除錯模式已關閉', 'yellow');
        }
        showMenuAndPrompt();
        break;
        
      case '10':
        log('\n產生並開啟測試報告...', 'cyan');
        try {
          execSync('npx playwright show-report', { stdio: 'inherit' });
        } catch (error) {
          log('無法開啟報告，請先執行測試', 'red');
        }
        showMenuAndPrompt();
        break;
        
      case '0':
        log('\n感謝使用！再見 👋', 'green');
        rl.close();
        process.exit(0);
        break;
        
      default:
        log('\n❌ 無效的選項，請重新選擇', 'red');
        showMenuAndPrompt();
    }
  });
}

// 檢查環境
function checkEnvironment() {
  log('檢查環境...', 'yellow');
  
  try {
    // 檢查 Playwright 是否安裝
    execSync('npx playwright --version', { stdio: 'ignore' });
    log('✓ Playwright 已安裝', 'green');
  } catch (error) {
    log('✗ Playwright 未安裝', 'red');
    log('請執行: npm install @playwright/test', 'yellow');
    process.exit(1);
  }
  
  // 檢查開發伺服器
  log('提示: 請確保開發伺服器正在運行 (npm run dev)', 'yellow');
  
  rl.question('\n開發伺服器是否已啟動？(y/n): ', (answer) => {
    if (answer.toLowerCase() !== 'y') {
      log('\n請先啟動開發伺服器:', 'yellow');
      log('  npm run dev', 'cyan');
      log('\n然後重新執行此腳本。', 'yellow');
      rl.close();
      process.exit(0);
    }
    
    showBanner();
    showMenuAndPrompt();
  });
}

// 主程式
showBanner();
checkEnvironment();
