import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { nhost } from './nhost';

// 使用 Nhost 的 GraphQL 端點
const httpLink = createHttpLink({
  uri: nhost.graphql.getUrl(),
});

// 設定認證 header - 使用 Nhost 的認證 token
const authLink = setContext(async (_, { headers }) => {
  // 獲取當前用戶的 access token
  const accessToken = await nhost.auth.getAccessToken();
  
  return {
    headers: {
      ...headers,
      // Nhost 使用標準的 Authorization header
      ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
    }
  }
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
