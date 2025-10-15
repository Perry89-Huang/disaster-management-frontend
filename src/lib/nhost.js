import { NhostClient } from '@nhost/nhost-js';

// 創建 Nhost 客戶端實例
export const nhost = new NhostClient({
  subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN,
  region: import.meta.env.VITE_NHOST_REGION,
});

// 導出 GraphQL 端點（用於直接訪問）
export const GRAPHQL_ENDPOINT = nhost.graphql.getUrl();

// 導出認證相關函數
export const auth = nhost.auth;
export const storage = nhost.storage;
export const functions = nhost.functions;
