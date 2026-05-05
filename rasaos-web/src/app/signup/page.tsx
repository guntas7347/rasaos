import { useState } from "react";
import {
  UserPlus,
  Store,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { setAuthCookie } from "../../lib/auth";
import { API_URL } from "../../lib/env";
import toast from "react-hot-toast";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    restaurantName: "",
    restaurantSlug: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Exclude confirmPassword from the submission payload
      const { confirmPassword, ...payload } = formData;

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMsg = "Failed to create account";
        try {
          const errData = await response.json();
          if (errData.error) errorMsg = errData.error;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (data.token) {
        setAuthCookie(data.token);
      }

      toast.success("Account and Restaurant created successfully!");
      // Redirect to restaurant portal; AuthContext will auto-fetch the newly created tenant data
      navigate("/restaurant");
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
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
              {step === 1 && (
                <UserPlus className="text-white w-8 h-8" strokeWidth={2} />
              )}
              {step === 2 && (
                <Store className="text-white w-8 h-8" strokeWidth={2} />
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400">
              {step === 1 && "Create Account"}
              {step === 2 && "Restaurant Info"}
            </h1>
            <p className="mt-3 text-neutral-500 dark:text-neutral-400 text-sm">
              Step {step} of 2
            </p>
          </div>

          <form
            onSubmit={step === 2 ? handleSubmit : handleNext}
            className="space-y-6"
          >
            {/* STEP 1: ACCOUNT DETAILS */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block ml-1">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                    placeholder="admin@restaurant.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 pr-11 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block ml-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 pr-11 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: RESTAURANT DETAILS */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block ml-1">
                    Restaurant Name
                  </label>
                  <input
                    name="restaurantName"
                    type="text"
                    required
                    minLength={2}
                    value={formData.restaurantName}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                    placeholder="e.g. The Rustic Scullery"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block ml-1">
                    URL Slug
                  </label>
                  <input
                    name="restaurantSlug"
                    type="text"
                    required
                    minLength={2}
                    value={formData.restaurantSlug}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                    placeholder="e.g. rustic-scullery"
                  />
                </div>
              </div>
            )}

            {/* NAVIGATION BUTTONS */}
            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-1/3 flex justify-center items-center py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium rounded-xl transition-all duration-200 active:scale-[0.98]"
                >
                  <ArrowLeft size={18} className="mr-1.5" />
                  Back
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 flex justify-center items-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-neutral-950 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] shadow-sm shadow-blue-500/20`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    {step < 2 ? "Continue" : "Complete Registration"}
                    {step < 2 && <ArrowRight size={18} className="ml-1.5" />}
                  </>
                )}
              </button>
            </div>
          </form>

          {step === 1 && (
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
          )}
        </div>
      </div>
    </div>
  );
}
