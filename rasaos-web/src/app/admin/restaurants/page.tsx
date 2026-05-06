import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Store, ChevronRight } from "lucide-react";
import { callServer } from "../../../lib/helpers";

interface RestaurantOverview {
  id: string;
  name: string;
  planName: string;
  subscriptionStatus: string;
}

export default function AdminRestaurantsPage() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<RestaurantOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      const response = await callServer("/admin/restaurants");
      if (response.success) {
        setRestaurants(response.data);
      } else {
        setError(response.message);
      }
      setIsLoading(false);
    };
    fetchRestaurants();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Restaurants
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Manage all registered restaurants and their subscriptions.
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800">
                <th className="px-6 py-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Restaurant Name
                </th>
                <th className="px-6 py-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Current Plan
                </th>
                <th className="px-6 py-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-neutral-500"
                  >
                    Loading restaurants...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-red-500"
                  >
                    Error: {error}
                  </td>
                </tr>
              ) : restaurants.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-neutral-500"
                  >
                    No restaurants found.
                  </td>
                </tr>
              ) : (
                restaurants.map((restaurant) => (
                  <tr
                    key={restaurant.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer group"
                    onClick={() =>
                      navigate(`/admin/restaurants/${restaurant.id}`)
                    }
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <Store size={20} />
                        </div>
                        <span className="font-medium text-neutral-900 dark:text-white">
                          {restaurant.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-600 dark:text-neutral-300">
                        {restaurant.planName || "None"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          restaurant.subscriptionStatus === "ACTIVE"
                            ? "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400"
                        }`}
                      >
                        {restaurant.subscriptionStatus || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center text-neutral-400 group-hover:text-blue-500 transition-colors">
                        <ChevronRight size={20} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
