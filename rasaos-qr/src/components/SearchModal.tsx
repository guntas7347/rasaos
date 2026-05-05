import { useState, useMemo } from "react";
import { Search, X, ChevronRight } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { Link, useParams } from "react-router-dom";
import { CurrencyIcon } from "./CurrencyIcon";
import { formatCurrency } from "../utils/currency";

export function SearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const { menuItems } = useAppContext();
  const { slug } = useParams();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return menuItems;

    return menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q),
    );
  }, [query, menuItems]);

  if (!isOpen) return null;

  return (
    <div className="fixed max-w-md mx-auto inset-0 z-[100] bg-background-light dark:bg-background-dark flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-primary/10 bg-white dark:bg-slate-900">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
        >
          <X size={24} />
        </button>
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            autoFocus
            type="text"
            placeholder="Search for dishes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border-transparent focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {query.trim() && results.length === 0 && (
          <div className="text-center py-10 opacity-60">
            No items found for "{query}"
          </div>
        )}
        <div className="space-y-3 pt-2">
          {results.map((item) => (
            <Link
              key={item.id}
              to={`/${slug}/i/${item.id}`}
              onClick={onClose}
              className="flex items-center gap-4 bg-white dark:bg-slate-900/40 p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800"
            >
              <div
                className="size-16 rounded-lg bg-cover bg-center shrink-0 shadow-sm"
                style={{ backgroundImage: `url('${item.image}')` }}
              ></div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                  {item.name}
                </p>
                <div className="text-primary font-bold mt-1 text-sm">
                  <CurrencyIcon />
                  {item.price ? formatCurrency(item.price) : "0.00"}
                </div>
              </div>
              <ChevronRight
                size={20}
                className="text-slate-300 dark:text-slate-600"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
