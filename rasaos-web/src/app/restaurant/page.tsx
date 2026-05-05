import { useAuth } from "../../contexts/AuthContext";

export default function RestaurantPage() {
  const { restaurant, isLoading, error, refreshContext } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-neutral-500 dark:text-neutral-400 font-medium animate-pulse">
          Loading portal...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-center flex flex-col items-center">
        <div className="text-4xl mb-3">⚠️</div>
        <h3 className="font-bold text-lg mb-1">Failed to Load Dashboard</h3>
        <p className="text-sm">{error}</p>
        <button
          onClick={() => refreshContext()}
          className="mt-6 px-4 py-2 bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors rounded-lg font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Metric Cards placeholders */}
        <div className="bg-white dark:bg-neutral-950 p-6 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
          <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
            Menus
          </div>
          <div className="text-3xl font-bold text-neutral-900 dark:text-white">
            {restaurant?.menus?.length || 0}
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-950 p-6 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
          <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
            Staff Members
          </div>
          <div className="text-3xl font-bold text-neutral-900 dark:text-white">
            {restaurant?.users?.length || 0}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-950 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Recent Activity
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Your latest platform updates will appear here.
          </p>
        </div>
        <div className="p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-4 text-neutral-400 dark:text-neutral-600">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <h3 className="font-medium text-neutral-900 dark:text-white mb-1">
            No activities found
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Everything up to date.
          </p>
        </div>
      </div>
    </div>
  );
}
