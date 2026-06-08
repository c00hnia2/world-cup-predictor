"use client";

import { useMemo, useState } from "react";

export interface SearchSelectOption {
  id: string;
  name: string;
}

interface SearchSelectProps {
  id: string;
  label: string;
  options: SearchSelectOption[];
  value: string;
  onChange: (optionId: string) => void;
  disabled?: boolean;
  placeholder?: string;
  emptyMessage?: string;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

const inputClassName =
  "h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20";

export function SearchSelect({
  id,
  label,
  options,
  value,
  onChange,
  disabled = false,
  placeholder = "Szukaj…",
  emptyMessage = "Brak wyników",
}: SearchSelectProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((option) => option.id === value);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) =>
      option.name.toLowerCase().includes(normalizedQuery),
    );
  }, [options, query]);

  function handleSelect(optionId: string) {
    onChange(optionId);
    setQuery("");
    setIsOpen(false);
  }

  function handleOpen() {
    setQuery("");
    setIsOpen(true);
  }

  function handleCollapse() {
    setQuery("");
    setIsOpen(false);
  }

  return (
    <div className="relative flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>

      {selectedOption && !isOpen ? (
        <button
          type="button"
          id={id}
          disabled={disabled}
          onClick={handleOpen}
          className="flex h-11 w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 text-left text-sm text-zinc-900 transition-colors hover:border-zinc-300 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600"
        >
          <span>{selectedOption.name}</span>
          <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            Zmień
            <ChevronIcon open={false} />
          </span>
        </button>
      ) : (
        <>
          <div className="relative">
            <input
              id={id}
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              disabled={disabled}
              placeholder={placeholder}
              autoComplete="off"
              className={`${inputClassName} ${isOpen ? "pr-10" : ""}`}
            />

            {isOpen && !disabled ? (
              <button
                type="button"
                onClick={handleCollapse}
                aria-label="Zwiń listę"
                aria-expanded={isOpen}
                className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 outline-none transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:ring-2 focus-visible:ring-emerald-500/30 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                <ChevronIcon open={isOpen} />
              </button>
            ) : null}
          </div>

          {isOpen && !disabled ? (
            <ul
              role="listbox"
              aria-label={label}
              className="absolute top-full z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
            >
              {filteredOptions.length === 0 ? (
                <li className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                  {emptyMessage}
                </li>
              ) : (
                filteredOptions.map((option) => (
                  <li key={option.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={option.id === value}
                      onClick={() => handleSelect(option.id)}
                      className={`flex w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-950/40 ${
                        option.id === value
                          ? "bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "text-zinc-800 dark:text-zinc-200"
                      }`}
                    >
                      {option.name}
                    </button>
                  </li>
                ))
              )}
            </ul>
          ) : null}
        </>
      )}
    </div>
  );
}
