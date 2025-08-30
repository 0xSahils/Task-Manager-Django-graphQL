import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  ApolloLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';

// HTTP Link
const httpLink = createHttpLink({
  uri: process.env.REACT_APP_GRAPHQL_URL || 'http://localhost:8000/graphql/',
  credentials: 'include', // Include cookies for session-based auth
});

// Auth Link - Add organization context to headers
const authLink = setContext((_, { headers }) => {
  // Get organization from localStorage or context
  const organizationSlug = localStorage.getItem('currentOrganizationSlug');
  const organizationId = localStorage.getItem('currentOrganizationId');

  return {
    headers: {
      ...headers,
      ...(organizationSlug && { 'X-Organization-Slug': organizationSlug }),
      ...(organizationId && { 'X-Organization-ID': organizationId }),
    },
  };
});

// Error Link - Handle GraphQL and network errors
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      
      // Handle specific error types
      if (extensions?.code === 'UNAUTHENTICATED') {
        // Handle authentication errors
        localStorage.removeItem('currentOrganizationSlug');
        localStorage.removeItem('currentOrganizationId');
        // Redirect to login or organization selection
      }
      
      if (extensions?.code === 'FORBIDDEN') {
        // Handle authorization errors
        console.error('Access denied to resource');
      }
    });
  }

  if (networkError) {
    console.error(`Network error: ${networkError}`);

    const status = (networkError as any)?.status || (networkError as any)?.statusCode;

    // Handle specific network errors
    if (status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('currentOrganizationSlug');
      localStorage.removeItem('currentOrganizationId');
    }

    if (typeof status === 'number' && status >= 500) {
      // Handle server errors
      console.error('Server error occurred');
    }
  }
});

// Retry Link - Retry failed requests
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: Infinity,
    jitter: true,
  },
  attempts: {
    max: 3,
    retryIf: (error, _operation) => {
      // Retry on network errors and 5xx server errors
      return !!error && (
        error.networkError?.statusCode >= 500 ||
        error.networkError?.name === 'ServerError'
      );
    },
  },
});

// Cache configuration
const cache = new InMemoryCache({
  typePolicies: {
    Organization: {
      fields: {
        projects: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
    Project: {
      fields: {
        tasks: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
    Task: {
      fields: {
        comments: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
    Query: {
      fields: {
        organizations: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
        projects: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
        tasks: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
  },
});

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: from([
    errorLink,
    retryLink,
    authLink,
    httpLink,
  ]),
  cache,
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    },
    query: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
  connectToDevTools: process.env.NODE_ENV === 'development',
});

// Helper functions for cache management
export const clearCache = () => {
  apolloClient.clearStore();
};

export const resetCache = () => {
  apolloClient.resetStore();
};

// Organization context helpers
export const setCurrentOrganization = (organizationSlug: string, organizationId: string) => {
  localStorage.setItem('currentOrganizationSlug', organizationSlug);
  localStorage.setItem('currentOrganizationId', organizationId);
  // Reset cache to refetch data with new organization context
  resetCache();
};

export const getCurrentOrganization = () => {
  return {
    slug: localStorage.getItem('currentOrganizationSlug'),
    id: localStorage.getItem('currentOrganizationId'),
  };
};

export const clearCurrentOrganization = () => {
  localStorage.removeItem('currentOrganizationSlug');
  localStorage.removeItem('currentOrganizationId');
  clearCache();
};
