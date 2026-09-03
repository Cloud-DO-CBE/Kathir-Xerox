'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface CustomerSuggestion {
  name: string;
  phone: string | null;
}

interface UseCustomerSearchReturn {
  suggestions: CustomerSuggestion[];
  isLoading: boolean;
  search: (query: string) => void;
  clearSuggestions: () => void;
}

export function useCustomerSearch(): UseCustomerSearchReturn {
  const [suggestions, setSuggestions] = useState<CustomerSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  const search = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query || query.length < 1) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(Array.isArray(data) ? data : []);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { suggestions, isLoading, search, clearSuggestions };
}
