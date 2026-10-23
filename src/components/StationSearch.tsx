import { useId, useState } from "react";
import { searchStations, type Station } from "../data/osi";

interface Props {
  label: string;
  placeholder: string;
  value: string;
  onSelect: (station: Station | null) => void;
  // Restricts suggestions, e.g. to stations that interchange with the first pick.
  candidates?: Station[];
}

export function StationSearch({ label, placeholder, value, onSelect, candidates }: Props) {
  const id = useId();
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [prevValue, setPrevValue] = useState(value);

  // Keep the input in sync when the selection changes from outside (links, back button).
  if (value !== prevValue) {
    setPrevValue(value);
    setQuery(value);
  }

  const allowed = candidates ? new Set(candidates.map((s) => s.key)) : null;
  const results = (
    allowed ? searchStations(query, 500).filter((s) => allowed.has(s.key)) : searchStations(query)
  ).slice(0, 10);
  const showList = open && results.length > 0;

  const choose = (station: Station) => {
    setQuery(station.name);
    setOpen(false);
    onSelect(station);
  };

  return (
    <div className="search">
      <label htmlFor={id}>{label}</label>
      <div className="search-field">
        <input
          id={id}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={`${id}-list`}
          aria-activedescendant={showList ? `${id}-opt-${active}` : undefined}
          autoComplete="off"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
            if (!e.target.value) onSelect(null);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((i) => Math.min(i + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter" && showList) {
              e.preventDefault();
              const station = results[active];
              if (station) choose(station);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
        />
        {showList && (
          <ul id={`${id}-list`} role="listbox" className="suggestions">
            {results.map((station, i) => (
              <li
                key={station.key}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={i === active}
                className={i === active ? "active" : undefined}
                // mousedown fires before the input's blur, so the click isn't lost.
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(station);
                }}
                onMouseEnter={() => setActive(i)}
              >
                <span>{station.name}</span>
                <small>
                  {station.connections.length} interchange
                  {station.connections.length === 1 ? "" : "s"}
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
