import { Search, QrCode } from "lucide-react";
import { useState } from "react";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="flex flex-col min-h-[calc(100vh-76px)] bg-background-light dark:bg-background-dark">
      {/* Header & Search Input */}
      <header className="sticky top-0 z-20 p-5 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="flex items-center justify-between">
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

      <main className="flex-1 px-4 pt-2 pb-24 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4 text-center opacity-70 px-4">
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
      </main>
    </div>
  );
}
