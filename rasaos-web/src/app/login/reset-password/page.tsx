import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, Check, X, ArrowRight } from "lucide-react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { callServer } from "../../../lib/helpers";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isValiduuid, setIsValiduuid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!uuid) {
        setErrorMessage("Missing reset link identifier.");
        setIsLoading(false);
        return;
      }

      const response = await callServer("/auth/reset-password/validate", {
        method: "POST",
        data: { uuid },
      });

      if (response.success) {
        setIsValiduuid(true);
      } else {
        setErrorMessage(
          response.message || "This link may have expired or is invalid.",
        );
      }
      setIsLoading(false);
    };

    validateToken();
  }, [uuid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);

    const response = await callServer("/auth/reset-password/confirm", {
      method: "POST",
      data: { uuid, newPassword: password },
    });

    setIsSubmitting(false);

    if (response.success) {
      toast.success(response.message || "Success");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 overflow-hidden relative selection:bg-blue-500/30">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 dark:bg-indigo-600/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-violet-500/10 dark:bg-violet-600/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md p-6 sm:p-8 relative z-10">
        <div className="bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl rounded-3xl shadow-xl dark:shadow-2xl dark:shadow-blue-900/10 border border-white/20 dark:border-neutral-800/50 p-8 sm:p-10 transition-all duration-300 hover:shadow-2xl">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 mb-6">
              <Lock className="text-white w-8 h-8" strokeWidth={2} />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400">
              Reset Password
            </h1>
            <p className="mt-3 text-neutral-500 dark:text-neutral-400 text-sm">
              Please enter your new password below.
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-sm text-neutral-500">
                Validating link...
              </p>
            </div>
          ) : !isValiduuid ? (
            <div className="text-center space-y-6 text-sm">
              <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-xl border border-red-200 dark:border-red-800/50 flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                  <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <p>{errorMessage}</p>
              </div>
              <Link
                to="/login/forget-password"
                className="inline-flex items-center justify-center w-full py-3.5 px-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors border border-black/10 dark:border-white/10"
              >
                Request new link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block ml-1"
                  htmlFor="password"
                >
                  New Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-blue-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-12 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block ml-1"
                  htmlFor="confirmPassword"
                >
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-blue-500 transition-colors">
                    <Check size={18} />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center py-3.5 px-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 dark:focus:ring-white dark:focus:ring-offset-neutral-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 group active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white dark:border-neutral-900/20 dark:border-t-neutral-900 rounded-full animate-spin"></div>
                ) : (
                  <>
                    Update Password
                    <ArrowRight
                      size={18}
                      className="ml-2 group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
