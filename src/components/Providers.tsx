'use client';
import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '../../store/store';
import { restoreSession } from '../../store/slices/authslice';

export default function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) storeRef.current = makeStore();

  useEffect(() => {
    // Restore the login after a page refresh (no-op if there is no refresh cookie)
    storeRef.current!.dispatch(restoreSession());
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}