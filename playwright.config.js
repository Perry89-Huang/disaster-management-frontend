import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 測試配置
 * 文檔：https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // 測試檔案位置
  testDir: './e2e',
  
  // 測試超時設定（增加到 60 秒）
  timeout: 60000,
  
  // 每個動作的超時時間
  expect: {
    timeout: 10000,
  },
  
  // 測試執行設定
  fullyParallel: false, // 初學建議設為 false，按順序執行方便除錯
  retries: 0, // 失敗不重試，方便發現問題
  workers: 1, // 使用 1 個 worker，避免資料衝突
  
  // 測試報告格式
  reporter: [
    ['list'], // 終端機顯示清單
    ['html', { open: 'never' }] // 產生 HTML 報告
  ],
  
  // 全域設定
  use: {
    // 您的 Vite 開發伺服器網址
    baseURL: 'http://localhost:5173',
    
    // 截圖：只在失敗時
    screenshot: 'only-on-failure',
    
    // 錄影：只在失敗時保留
    video: 'retain-on-failure',
    
    // 追蹤：第一次重試時啟用（用於除錯）
    trace: 'on-first-retry',
    
    // 語言和時區
    locale: 'zh-TW',
    timezoneId: 'Asia/Taipei',
  },

  // 測試專案（裝置/瀏覽器）
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },
  ],

  // 自動啟動開發伺服器
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI, // 本地開發時重用已啟動的伺服器
    timeout: 120000, // 等待伺服器啟動的超時時間（2分鐘）
  },
});