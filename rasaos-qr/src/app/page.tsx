import { Search, QrCode, Clock, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/dexie/dexie";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const recentRestaurants = useLiveQuery(() =>
    db.recentRestaurants.orderBy("lastVisited").reverse().toArray(),
  );

  return (
    <div className="flex flex-col">
      {/* Header & Search Input */}
      <header className="sticky top-0 z-20 p-5 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">
              Scan the QR to proceed
            </h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <div className="flex w-full items-center rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus-within:border-primary transition-all">
            <div className="flex items-center justify-center pl-4 text-slate-400">
              <Search size={20} />
            </div>
            <input
              className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-base font-medium py-3 px-3 placeholder:text-slate-400"
              placeholder="Search for a restaurant..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 pt-2">
        {recentRestaurants && recentRestaurants.length > 0 ? (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-slate-100 px-1">
              <Clock size={20} className="text-primary" />
              <h2 className="text-lg font-bold tracking-tight">
                Recently Visited
              </h2>
            </div>
            <div className="space-y-3">
              {recentRestaurants.map((rest) => (
                <div
                  key={rest.slug}
                  onClick={() => navigate(`/${rest.slug}`)}
                  className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                      {rest.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-base">{rest.name}</h3>
                      <p className="text-xs text-slate-500">
                        {new Date(rest.lastVisited).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col items-center justify-center gap-4 text-center opacity-70 px-4 mt-12 mb-12">
          <div className="h-24 w-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2">
            <QrCode size={48} className="text-slate-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Ready to order?
          </h2>
          <p className="text-base font-medium text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
            Please scan a table QR code to view the menu and place your order.
          </p>
        </div>
      </div>
    </div>
  );
}
