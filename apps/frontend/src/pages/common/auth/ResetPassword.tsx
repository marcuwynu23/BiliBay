import {useState, useEffect} from "react";
import {useNavigate, useSearchParams, Link} from "react-router-dom";
import {Page} from "@bilibay/ui";
import {api} from "~/utils/api";
import {
  LockClosedIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import IllustrationBackground from "~/components/common/IllustrationBackground";
import bilibayLogo from "~/assets/icons/bilibay-logo-rectangle-light.svg";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword: password,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Page className="min-h-screen bg-gradient-to-br from-[#749347] to-[#5a7036] flex flex-col md:flex-row relative overflow-hidden">
        {/* Desktop Left Side - Illustration */}
        <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
          <IllustrationBackground className="w-full h-full" />
        </div>

        {/* Right Side - Form Container */}
        <div className="w-full md:w-1/2 flex items-center justify-center min-h-screen md:min-h-0 py-0 md:py-12 px-0 md:px-8 lg:px-12 relative z-10">
          {/* Home Button */}
          <Link
            to="/"
            className="absolute top-4 right-4 md:top-6 md:right-8 z-50 p-2.5 md:p-3  transition-all duration-200 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Home"
          >
            <HomeIcon className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </Link>

          <div className="max-w-md w-full h-auto relative">
            <div className="bg-transparent overflow-hidden h-auto flex flex-col">
              <div className="p-6 md:p-8 space-y-5 md:space-y-6 text-center flex flex-col justify-center pt-safe pb-safe">
              <div className="flex justify-center mb-4">
                <img 
                  src={bilibayLogo} 
                  alt="BiliBay Logo" 
                  className="h-12 sm:h-14 md:h-16 w-auto"
                />
              </div>
              <CheckCircleIcon className="h-16 w-16 text-white mx-auto" />
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Password Reset Successful!
              </h2>
              <p className="text-sm sm:text-base text-white/90">
                Your password has been reset successfully. Redirecting to login...
              </p>
              </div>
            </div>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page className="min-h-screen bg-[#749347] flex flex-col md:flex-row relative overflow-hidden">
      {/* Desktop Left Side - Illustration */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <IllustrationBackground className="w-full h-full" />
      </div>

      {/* Right Side - Form Container */}
      <div className="w-full md:w-1/2 flex items-center justify-center min-h-screen md:min-h-0 py-0 md:py-12 px-0 md:px-8 lg:px-12 relative z-10">
        {/* Home Button */}
        <Link
          to="/"
          className="absolute top-4 right-4 md:top-6 md:right-8 z-50 p-2.5 md:p-3  transition-all duration-200 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Home"
        >
          <HomeIcon className="h-5 w-5 md:h-6 md:w-6 text-white" />
        </Link>

        <div className="max-w-md w-full h-auto relative">
          <div className="bg-transparent overflow-hidden h-auto flex flex-col">
            <div className="p-6 md:p-8 space-y-5 md:space-y-6 flex flex-col overflow-y-auto pt-safe pb-safe">
            {/* Header */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <img 
                  src={bilibayLogo} 
                  alt="BiliBay Logo" 
                  className="h-12 sm:h-14 md:h-16 w-auto"
                />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Reset Password
              </h2>
              <p className="text-sm sm:text-base text-white/90">
                Enter your new password below.
              </p>
            </div>

            <form className="flex-1 flex flex-col min-h-0" onSubmit={handleSubmit}>
              <div className="flex-1 overflow-y-auto -webkit-overflow-scrolling-touch space-y-5">
                {error && (
                  <div className="rounded-lg bg-red-500/20 backdrop-blur-sm border border-red-300/50 p-4 flex items-start gap-3">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-200 flex-shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-white">{error}</div>
                  </div>
                )}

                {/* New Password Input */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs sm:text-sm font-semibold text-white mb-2"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-white/70" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      className="block w-full pl-10 pr-12 py-3 sm:py-2.5 text-base sm:text-sm bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all touch-manipulation"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70 hover:text-white transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs sm:text-sm font-semibold text-white mb-2"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-white/70" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      className="block w-full pl-10 pr-12 py-3 sm:py-2.5 text-base sm:text-sm bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all touch-manipulation"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70 hover:text-white transition-colors"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !token}
                className="w-full flex items-center justify-center gap-2 bg-white text-[#8ead5d] py-3.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-white/90 active:bg-white/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation min-h-[48px] text-base sm:text-sm flex-shrink-0 mt-5"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-[#8ead5d] border-t-transparent"></div>
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </>
                )}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="text-center pt-4 border-t border-white/20">
              <p className="text-xs sm:text-sm text-white/90">
                <Link
                  to="/login"
                  className="font-semibold text-white hover:text-white/80 transition-colors underline"
                >
                  Back to Sign in
                </Link>
              </p>
            </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
