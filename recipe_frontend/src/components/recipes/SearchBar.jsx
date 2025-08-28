import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * SearchBar controls the search query in the URL.
 *
 * Props:
 * - placeholder?: string
 */
export default function SearchBar({ placeholder = "Search recipes..." }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initial = searchParams.get("q") || "";
  const [q, setQ] = useState(initial);

  useEffect(() => {
    setQ(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const onSubmit = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (q) next.set("q", q);
    else next.delete("q");
    next.set("page", "1"); // reset to first page on new search
    navigate(`/search?${next.toString()}`);
  };

  return (
    <form onSubmit={onSubmit} style={styles.form} role="search" aria-label="Recipe search">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        style={styles.input}
        aria-label="Search query"
      />
      <button type="submit">Search</button>
    </form>
  );
}

const styles = {
  form: {
    display: "flex",
    gap: 8,
    margin: "8px 0 16px",
  },
  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid var(--border)",
    outline: "none",
  },
};
