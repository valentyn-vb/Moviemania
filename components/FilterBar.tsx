"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TbAdjustmentsHorizontal } from "react-icons/tb";
import {
  CERT_OPTIONS,
  DEFAULT_SORT,
  MIN_VOTES_OPTIONS,
  PRESETS,
  SORT_OPTIONS,
  TV_STATUS_OPTIONS,
  TV_TYPE_OPTIONS,
  YEAR_OPTIONS,
  activeFilterCount,
  parseFilters,
  serializeFilters,
  type Filters,
  type Option,
} from "@/lib/filters";
import type { Genre, MediaType } from "@/lib/types";

const chipBase =
  "rounded-[30px] border px-6 py-2 text-s transition-colors duration-300 outline-none";
const chipOn = "border-accent bg-accent-soft text-accent";
const chipOff = "border-muted text-muted hover:border-accent hover:text-accent";

const selectClass =
  "rounded-md border border-muted bg-page px-3 py-2 text-s font-normal text-light outline-none focus:border-accent";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-wider text-muted">{label}</span>
      {children}
    </label>
  );
}

/**
 * Renders "Any" as the empty value so an unset filter round-trips to an absent
 * query param — `with_status: 0` (Returning) is a legitimate value, so options
 * are matched by string identity rather than truthiness. `allowAny={false}` is
 * for Sort, which always holds a value and so has nothing to clear to.
 */
function Select<T extends string | number>({
  label,
  value,
  options,
  onChange,
  allowAny = true,
}: {
  label: string;
  value: T | undefined;
  options: Option<T>[];
  onChange: (value: T | undefined) => void;
  allowAny?: boolean;
}) {
  return (
    <Field label={label}>
      <select
        value={value === undefined ? "" : String(value)}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(raw === "" ? undefined : options.find((o) => String(o.value) === raw)?.value);
        }}
        className={selectClass}
      >
        {allowAny && <option value="">Any</option>}
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export default function FilterBar({ media, genres }: { media: MediaType; genres: Genre[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const filters = parseFilters(media, searchParams);
  const appliedCount = activeFilterCount(filters);

  // Open by default when arriving on a URL that already carries filters, so a
  // shared link shows what's applied rather than hiding it behind a toggle.
  const [isOpen, setIsOpen] = useState(appliedCount > 0);

  const apply = (next: Filters) => {
    const qs = serializeFilters(media, next);
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  const patch = (changes: Partial<Filters>) => apply({ ...filters, ...changes });

  return (
    <div className={`mt-8 px-8 ${isPending ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {PRESETS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={filters.sort === value}
            onClick={() => patch({ sort: value })}
            className={`${chipBase} ${filters.sort === value ? chipOn : chipOff}`}
          >
            {label}
          </button>
        ))}

        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className={`${chipBase} ${appliedCount > 0 ? chipOn : chipOff} flex items-center gap-2`}
        >
          <TbAdjustmentsHorizontal aria-hidden />
          Filters
          {appliedCount > 0 && <span>({appliedCount})</span>}
        </button>
      </div>

      {isOpen && (
        <div className="mt-6 rounded-lg bg-secondary p-6">
          <div className="grid grid-cols-2 gap-4 pc:grid-cols-3">
            <Select
              label="Genre"
              value={filters.genre}
              options={genres.map(({ id, name }) => ({ value: id, label: name }))}
              onChange={(genre) => patch({ genre })}
            />
            <Select
              label="Sort by"
              value={filters.sort}
              options={SORT_OPTIONS[media]}
              allowAny={false}
              onChange={(sort) => patch({ sort: sort ?? DEFAULT_SORT })}
            />
            <Select
              label="Year from"
              value={filters.yearFrom}
              options={YEAR_OPTIONS.map((y) => ({ value: y, label: String(y) }))}
              onChange={(yearFrom) => patch({ yearFrom })}
            />
            <Select
              label="Year to"
              value={filters.yearTo}
              options={YEAR_OPTIONS.map((y) => ({ value: y, label: String(y) }))}
              onChange={(yearTo) => patch({ yearTo })}
            />
            <Select
              label="Min votes"
              value={filters.minVotes}
              options={MIN_VOTES_OPTIONS}
              onChange={(minVotes) => patch({ minVotes })}
            />
            {media === "tv" ? (
              <>
                <Select
                  label="Status"
                  value={filters.status}
                  options={TV_STATUS_OPTIONS}
                  onChange={(status) => patch({ status })}
                />
                <Select
                  label="Type"
                  value={filters.type}
                  options={TV_TYPE_OPTIONS}
                  onChange={(type) => patch({ type })}
                />
              </>
            ) : (
              <Select
                label="Age rating"
                value={filters.cert}
                options={CERT_OPTIONS}
                onChange={(cert) => patch({ cert })}
              />
            )}
          </div>

          {appliedCount > 0 && (
            <button
              type="button"
              onClick={() => apply({ sort: filters.sort })}
              className="mt-6 text-s text-accent underline outline-none"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
