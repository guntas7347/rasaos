import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { callServer } from "../../../lib/helpers";
import toast from "react-hot-toast";
import { Save, Building2, ShieldCheck, Calendar, Clock } from "lucide-react";

export default function SettingsPage() {
  const { restaurant, refreshContext } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    taxRate: "",
    taxMode: "EXCLUSIVE",
    currency: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || "",
        slug: restaurant.slug || "",
        taxRate:
          restaurant.taxRate !== undefined ? String(restaurant.taxRate) : "",
        taxMode: restaurant.taxMode || "EXCLUSIVE",
        currency: restaurant.currency || "",
      });
    }
  }, [restaurant]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      name: formData.name,
      slug: formData.slug,
      taxRate: formData.taxRate ? Number(formData.taxRate) : undefined,
      taxMode: formData.taxMode,
      currency: formData.currency,
    };

    const response = await callServer("/restaurant", {
      method: "POST",
      data: payload,
    });

    if (response.success) {
      toast.success("Settings updated successfully!");
      await refreshContext();
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <Building2 size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Restaurant Settings
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Manage your core platform settings here.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white dark:bg-neutral-950 p-6 sm:p-8 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block">
              Restaurant Name
            </label>
            <input
              name="name"
              type="text"
              required
              minLength={2}
              value={formData.name}
              onChange={handleChange}
              className="block w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
              placeholder="e.g. The Rustic Scullery"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block">
              URL Slug
            </label>
            <input
              name="slug"
              type="text"
              required
              minLength={2}
              value={formData.slug}
              onChange={handleChange}
              className="block w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
              placeholder="e.g. rustic-scullery"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block">
              Currency
            </label>
            <input
              name="currency"
              type="text"
              maxLength={3}
              value={formData.currency}
              onChange={handleChange}
              className="block w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 uppercase"
              placeholder="USD"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block">
              Tax Mode
            </label>
            <select
              name="taxMode"
              value={formData.taxMode}
              onChange={handleChange}
              className="block w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
            >
              <option value="EXCLUSIVE">Exclusive (Added to bill)</option>
              <option value="INCLUSIVE">Inclusive (Already in price)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block">
              Tax Rate (%)
            </label>
            <input
              name="taxRate"
              type="number"
              step="0.01"
              min="0"
              value={formData.taxRate}
              onChange={handleChange}
              className="block w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
              placeholder="e.g. 5.5"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-neutral-950 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] shadow-sm shadow-blue-500/20"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* Subscriptions History Table */}
      <div className=" mb-20 bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Subscription History
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
                <th className="px-6 py-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Plan Name
                </th>
                <th className="px-6 py-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Status
                </th>
                <th className="px-6 py-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Start Date
                </th>
                <th className="px-6 py-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Expiry Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {restaurant?.subscriptionHistory?.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-neutral-500"
                  >
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                restaurant?.subscriptionHistory?.map(
                  (sub: any, index: number) => (
                    <tr
                      key={index}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={18} className="text-blue-500" />
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {sub.plan}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            sub.status === "ACTIVE"
                              ? "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400"
                              : sub.status === "FUTURE"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400"
                                : "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400"
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300 text-sm">
                          <Calendar size={14} />
                          {new Date(sub.periodStart).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300 text-sm">
                          <Clock size={14} />
                          {new Date(sub.periodEnd).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
