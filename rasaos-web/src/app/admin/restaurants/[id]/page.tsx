import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Calendar,
  ShieldCheck,
  Clock,
  Edit2,
  X,
  Check,
} from "lucide-react";
import { callServer } from "../../../../lib/helpers";
import toast from "react-hot-toast";

interface SubHistory {
  id: string;
  plan: string;
  status: "ACTIVE" | "EXPIRED" | "FUTURE";
  periodStart: string;
  periodEnd: string;
}

interface RestaurantData {
  name: string;
  slug: string;
  userEmail: string | null;
  subscriptionHistory: SubHistory[];
}

export default function AdminRestaurantDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<RestaurantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for new subscription form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlan, setNewPlan] = useState("Basic Plan");
  const [startDate, setStartDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isSubmittingSub, setIsSubmittingSub] = useState(false);

  // State for editing restaurant details
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      const response = await callServer(`/admin/restaurant/${id}`);
      if (response.success) {
        const resData = response.data;
        console.log(resData);
        setEditName(resData.name);
        setEditSlug(resData.slug);
      } else {
        setError(response.message);
      }
      setIsLoading(false);
    };
    if (id) fetchDetails();
  }, [id]);

  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingSub(true);
    const response = await callServer(`/admin/subscription/${id}`, {
      method: "POST",
      data: {
        plan: newPlan,
        periodStart: startDate,
        periodEnd: expiryDate,
      },
    });

    if (response.success) {
      toast.success(response.message || "Success");
      window.location.reload();
    } else {
      setIsSubmittingSub(false);
    }
  };

  const handleDeleteSubscription = async (subscriptionId: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this subscription?",
    );
    if (!confirm) return;

    const response = await callServer(`/admin/subscription/${subscriptionId}`, {
      method: "DELETE",
    });

    if (response.success) {
      toast.success(response.message || "Success");
      window.location.reload();
    }
  };

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingEdit(true);
    const response = await callServer(`/admin/restaurant/${id}`, {
      method: "POST",
      data: {
        name: editName,
        slug: editSlug,
      },
    });

    if (response.success) {
      toast.success(response.message || "Success");
      window.location.reload();
    } else {
      setIsSubmittingEdit(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-neutral-500">Loading details...</div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-red-500">
        Error: {error || "Not found"}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/admin/restaurants")}
          className="p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft
            size={20}
            className="text-neutral-600 dark:text-neutral-400"
          />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {data.name}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Restaurant Details & Subscriptions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Details Card */}
        <div className="lg:col-span-1 bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Basic Details
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-neutral-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Edit2 size={16} />
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdateDetails} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-900 text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Slug
                </label>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-900 text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="flex-1 flex justify-center items-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Check size={16} className="mr-1" /> Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(data.name);
                    setEditSlug(data.slug);
                  }}
                  className="flex-1 flex justify-center items-center py-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm font-medium transition-colors"
                >
                  <X size={16} className="mr-1" /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Slug
                </p>
                <p className="font-medium text-neutral-900 dark:text-white">
                  /{data.slug}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Owner Email
                </p>
                <p className="font-medium text-neutral-900 dark:text-white">
                  {data.userEmail || (
                    <span className="text-neutral-400 italic">
                      No user assigned
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Subscriptions Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add Subscription Form */}
          {showAddForm ? (
            <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Add New Subscription
                </h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                >
                  Cancel
                </button>
              </div>
              <form onSubmit={handleAddSubscription} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Plan
                    </label>
                    <select
                      value={newPlan}
                      onChange={(e) => setNewPlan(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Basic Plan">Basic Plan</option>
                      <option value="Pro Plan">Pro Plan</option>
                      <option value="Enterprise Plan">Enterprise Plan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      required
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingSub}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    Save Subscription
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
              >
                <Plus size={18} />
                Add Subscription
              </button>
            </div>
          )}

          {/* Subscriptions History Table */}
          <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
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
                    <th className="px-6 py-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {data.subscriptionHistory.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-neutral-500"
                      >
                        No subscriptions found.
                      </td>
                    </tr>
                  ) : (
                    data.subscriptionHistory.map((sub, index) => (
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
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeleteSubscription(sub.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
