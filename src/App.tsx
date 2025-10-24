import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, persistor } from './utils/store';
import AppNavigator from './navigation/AppNavigator';
import AuthProvider from './components/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { COLORS } from './utils/constants';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <AuthProvider>
              <AppNavigator />
              <StatusBar style="light" backgroundColor={COLORS.JW_TOP_BG} />
            </AuthProvider>
          </PersistGate>
        </Provider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
} 