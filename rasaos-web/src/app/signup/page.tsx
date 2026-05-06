import { useState } from "react";
import { UserPlus, ArrowRight, Mail, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { callServer } from "../../lib/helpers";
import toast from "react-hot-toast";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    restaurantSlug: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const slugify = (value: string) => value.replace(/^-|-$/g, "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const formattedValue = value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-");

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      email: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const response = await callServer("/auth/signup", {
      method: "POST",
      data: formData,
    });

    setIsLoading(false);

    if (response.success) {
      setIsSuccess(true);
      toast.success(response.message || "Success");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 overflow-hidden relative selection:bg-blue-500/30">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
        <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-violet-500/10 dark:bg-violet-600/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md p-6 sm:p-8 relative z-10">
        <div className="bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl rounded-3xl shadow-xl dark:shadow-2xl dark:shadow-blue-900/10 border border-white/20 dark:border-neutral-800/50 p-8 sm:p-10 transition-all duration-300 hover:shadow-2xl my-4">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 mb-6">
              <UserPlus className="text-white w-8 h-8" strokeWidth={2} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400">
              Create Account
            </h1>
            <p className="mt-3 text-neutral-500 dark:text-neutral-400 text-sm">
              Start your 30-day free trial today.
            </p>
          </div>

          {isSuccess ? (
            <div className="text-center space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-6 rounded-2xl border border-blue-200 dark:border-blue-800/50">
                <Mail className="w-12 h-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold mb-2">Check your email</h2>
                <p className="text-sm">
                  We've sent a verification link to{" "}
                  <strong>{formData.email}</strong>. Please click the link to
                  verify your email and complete your registration.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-block font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block ml-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-blue-500 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleEmailChange}
                      className="block w-full pl-11 pr-4 py-3 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                      placeholder="admin@restaurant.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block ml-1">
                    Restaurant URL Slug
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-blue-500 transition-colors">
                      <Globe size={18} />
                    </div>
                    <input
                      name="restaurantSlug"
                      type="text"
                      required
                      minLength={2}
                      value={formData.restaurantSlug}
                      onChange={handleChange}
                      className="block w-full pl-11 pr-4 py-3 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                      placeholder="my-awesome-restaurant"
                    />
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1 ml-1">
                    This will be your unique URL: rasaos.com/
                    <b>{slugify(formData.restaurantSlug) || "your-slug"}</b>
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-neutral-950 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] shadow-sm shadow-blue-500/20"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Send Verification Link
                    <ArrowRight size={18} className="ml-2" />
                  </>
                )}
              </button>

              <div className="mt-8 text-center">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    Log In
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
