import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_HASURA_GRAPHQL_ENDPOINT ,
});

// 設定認證 header
const authLink = setContext((_, { headers }) => {
  const token = import.meta.env.VITE_HASURA_ADMIN_SECRET;
  
  return {
    headers: {
      ...headers,
      'x-hasura-admin-secret': token,
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