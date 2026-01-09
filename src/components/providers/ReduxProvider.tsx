'use client';

/**
 * Redux Provider 组件
 */

import { Provider } from 'react-redux';
import { store } from '@/stores/gameStore';

interface ReduxProviderProps {
  children: React.ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return <Provider store={store}>{children}</Provider>;
}
