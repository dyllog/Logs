import { createContext, useContext } from 'react';

// Provides a function to open the search overlay with an optional pre-filled query
export const SearchContext = createContext<(q?: string) => void>(() => {});

export function useOpenSearch() {
  return useContext(SearchContext);
}
