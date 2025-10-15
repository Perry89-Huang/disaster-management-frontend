// 測試 Nhost 連接的腳本
// 在瀏覽器控制台中運行此代碼

console.log('=== Nhost 配置檢查 ===');

// 1. 檢查環境變量
console.log('Subdomain:', import.meta.env.VITE_NHOST_SUBDOMAIN);
console.log('Region:', import.meta.env.VITE_NHOST_REGION);

// 2. 檢查 Nhost 實例（需要先導入）
// import { nhost } from './lib/nhost';
// console.log('GraphQL URL:', nhost.graphql.getUrl());
// console.log('Auth URL:', nhost.auth.url);
// console.log('Storage URL:', nhost.storage.url);

// 3. 測試 GraphQL 查詢
async function testGraphQLConnection() {
  const { nhost } = await import('./lib/nhost');
  
  console.log('\n=== GraphQL 端點測試 ===');
  console.log('URL:', nhost.graphql.getUrl());
  
  // 簡單的查詢測試
  try {
    const query = `
      query {
        volunteers_aggregate {
          aggregate {
            count
          }
        }
      }
    `;
    
    const response = await fetch(nhost.graphql.getUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    const result = await response.json();
    console.log('✅ GraphQL 連接成功!');
    console.log('志工數量:', result.data?.volunteers_aggregate?.aggregate?.count || 0);
    return result;
  } catch (error) {
    console.error('❌ GraphQL 連接失敗:', error);
    return null;
  }
}

// 4. 執行測試
console.log('\n開始測試 GraphQL 連接...');
testGraphQLConnection().then(result => {
  if (result) {
    console.log('\n完整響應:', result);
  }
});

// 5. 檢查認證狀態
async function checkAuthStatus() {
  const { nhost } = await import('./lib/nhost');
  
  console.log('\n=== 認證狀態 ===');
  console.log('已登入:', nhost.auth.isAuthenticated());
  console.log('用戶:', nhost.auth.getUser());
  
  const token = await nhost.auth.getAccessToken();
  console.log('Access Token:', token ? '存在' : '不存在');
}

checkAuthStatus();
