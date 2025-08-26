'use client';

import { useCallback, useEffect, useId, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import css from './SearchBox.module.css';

export interface SearchBoxProps {
  onSearch: (search: string) => void;
  defaultValue?: string;
  delay?: number;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export default function SearchBox({
  onSearch,
  defaultValue = '',
  delay = 300,
  placeholder = 'Search notes...',
  className,
  autoFocus,
}: SearchBoxProps) {
  const [value, setValue] = useState<string>(defaultValue);
  const inputId = useId();

  useEffect(() => {
    const t = setTimeout(() => {
      onSearch(value);
    }, delay);
    return () => clearTimeout(t);
  }, [value, delay, onSearch]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSearch(value);
      }
      if (e.key === 'Escape') {
        setValue('');
        onSearch('');
      }
    },
    [onSearch, value],
  );

  const clear = useCallback(() => {
    setValue('');
    onSearch('');
  }, [onSearch]);

  return (
    <div className={`${css.searchBox} ${className ?? ''}`}>
      <label htmlFor={inputId} className="sr-only">
        Search notes
      </label>
      <input
        id={inputId}
        name="search"
        type="search"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="Search notes"
        autoComplete="off"
        inputMode="search"
        className={css.input}
        autoFocus={autoFocus}
      />
      {value && (
        <button type="button" onClick={clear} aria-label="Clear search" className={css.clearButton}>
          ×
        </button>
      )}
    </div>
  );
}
