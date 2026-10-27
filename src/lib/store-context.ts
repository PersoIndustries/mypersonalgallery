import { createContext } from 'react';
import type { StoreValue } from './store';

// Keep the context identity outside the hot-reloaded provider module.
export const StoreContext = createContext<StoreValue | null>(null);