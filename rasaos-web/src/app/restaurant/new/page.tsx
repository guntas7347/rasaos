import { useState } from "react";
import { Store, Link as LinkIcon, Plus, ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { callServer } from "../../../lib/helpers";
import toast from "react-hot-toast";

export default function AddRestaurantPage() {
  const [formData, setFormData] = useState({
    restaurantName: "",
    slug: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshContext } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const response = await callServer("/restaurant", {
      method: "POST",
      data: formData,
    });

    if (response.success) {
      toast.success("Restaurant created successfully!");
      await refreshContext();
      navigate("/restaurant");
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link 
            to="/restaurant" 
            className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <Store size={20} />
            </div>
            Create Your Restaurant
          </h1>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400 text-sm">
            Set up your organization to start managing menus and orders.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">

          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-2">
              Restaurant Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 ml-1" htmlFor="restaurantName">
                  Restaurant Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-blue-500 transition-colors">
                    <Store size={18} />
                  </div>
                  <input
                    id="restaurantName"
                    name="restaurantName"
                    type="text"
                    value={formData.restaurantName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                    placeholder="e.g. The Rustic Scullery"
                    required
                    minLength={2}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 ml-1" htmlFor="slug">
                  URL Slug
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-blue-500 transition-colors">
                    <LinkIcon size={18} />
                  </div>
                  <input
                    id="slug"
                    name="slug"
                    type="text"
                    value={formData.slug}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                    placeholder="e.g. rustic-scullery"
                    required
                    minLength={2}
                  />
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 ml-1 mt-1">
                  Used for the restaurant's unique menu URL.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => navigate("/restaurant")}
              className="px-6 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-neutral-950 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] shadow-sm shadow-blue-500/20"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Plus size={18} className="mr-2" />
                  Create Restaurant
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
