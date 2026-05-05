import { LayoutDashboard } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-950 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden group"
          >
            {/* Subtle gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-4 transition-colors group-hover:bg-white dark:group-hover:bg-neutral-800">
                <div className="w-5 h-5 bg-neutral-300 dark:bg-neutral-700 rounded-md group-hover:bg-blue-500 dark:group-hover:bg-blue-400 transition-colors"></div>
              </div>
              <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">
                Total metrics
              </h3>
              <p className="text-2xl font-semibold mt-1 text-neutral-900 dark:text-white">
                ---
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden min-h-[400px] flex items-center justify-center relative">
        {/* Subtle decorative background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        ></div>

        <div className="text-center p-8 relative z-10">
          <div className="w-16 h-16 mx-auto bg-neutral-100 dark:bg-neutral-900 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <LayoutDashboard
              className="text-neutral-400 dark:text-neutral-500"
              size={28}
            />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
            Dashboard Empty
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2 max-w-sm mx-auto">
            Statistics and reports will appear here once data starts flowing
            through the system.
          </p>
        </div>
      </div>
    </div>
  );
}
