import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { callServer } from "../../lib/helpers";
import toast from "react-hot-toast";
import { Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

const VerifyPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying",
  );
  const [message, setMessage] = useState("We're verifying your account...");

  const token = searchParams.get("token");

  useEffect(() => {
    const handleVerify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid or missing verification token.");
        return;
      }

      const response = await callServer(`/auth/register/${token}`, {
        method: "POST",
      });

      if (response.success) {
        setStatus("success");
        setMessage("Account verified successfully! Redirecting to login...");
        toast.success(response.message || "Success");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(
          response.message || "Verification failed. The link may be expired.",
        );
      }
    };

    handleVerify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 overflow-hidden relative selection:bg-blue-500/30">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 dark:bg-indigo-600/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-violet-500/10 dark:bg-violet-600/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md p-6 sm:p-8 relative z-10">
        <div className="bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl rounded-3xl shadow-xl dark:shadow-2xl dark:shadow-blue-900/10 border border-white/20 dark:border-neutral-800/50 p-8 sm:p-10 transition-all duration-300 hover:shadow-2xl text-center">
          <div className="mb-8">
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-lg mb-6 transition-all duration-500 ${
                status === "verifying"
                  ? "bg-blue-600"
                  : status === "success"
                    ? "bg-green-600"
                    : "bg-red-600"
              }`}
            >
              {status === "verifying" && (
                <Loader2 className="text-white w-10 h-10 animate-spin" />
              )}
              {status === "success" && (
                <CheckCircle2 className="text-white w-10 h-10 animate-in zoom-in duration-300" />
              )}
              {status === "error" && (
                <XCircle className="text-white w-10 h-10 animate-in zoom-in duration-300" />
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400">
              {status === "verifying" && "Verifying Account"}
              {status === "success" && "Success!"}
              {status === "error" && "Verification Failed"}
            </h1>
            <p className="mt-4 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base leading-relaxed">
              {message}
            </p>
          </div>

          {status === "error" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Link
                to="/signup"
                className="w-full flex items-center justify-center py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 active:scale-[0.98] shadow-sm shadow-blue-500/20"
              >
                Try Signing Up Again
                <ArrowRight size={18} className="ml-2" />
              </Link>
              <Link
                to="/login"
                className="block text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          )}

          {status === "success" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Link
                to="/login"
                className="w-full flex items-center justify-center py-3.5 px-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all duration-200 active:scale-[0.98]"
              >
                Go to Login Now
                <ArrowRight size={18} className="ml-2" />
              </Link>
            </div>
          )}

          {status === "verifying" && (
            <div className="flex justify-center items-center gap-2 text-neutral-400 dark:text-neutral-500 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse animation-delay-200"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse animation-delay-400"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;
