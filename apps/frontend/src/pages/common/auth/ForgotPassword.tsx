import {useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import {Page} from "@bilibay/ui";
import {api} from "~/utils/api";
import {
  EnvelopeIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import IllustrationBackground from "~/components/common/IllustrationBackground";
import bilibayLogo from "~/assets/icons/bilibay-logo-rectangle-light.svg";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", {email});
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

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
            <div className="p-6 md:p-8 space-y-5 md:space-y-6 flex flex-col pt-safe pb-safe">
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
                Forgot Password?
              </h2>
              <p className="text-sm sm:text-base text-white/90">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {success ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-500/20 backdrop-blur-sm border border-green-300/50 p-4 flex items-start gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-200 flex-shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-white">
                    If an account with that email exists, we've sent you a password reset link. Please check your email.
                  </div>
                </div>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full flex items-center justify-center gap-2 bg-white text-[#8ead5d] py-3.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-white/90 active:bg-white/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation min-h-[48px] text-base sm:text-sm"
                >
                  <span>Back to Login</span>
                  <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            ) : (
              <form className="flex-1 flex flex-col min-h-0" onSubmit={handleSubmit}>
                <div className="flex-1 overflow-y-auto -webkit-overflow-scrolling-touch space-y-5">
                  {error && (
                    <div className="rounded-lg bg-red-500/20 backdrop-blur-sm border border-red-300/50 p-4 flex items-start gap-3">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-200 flex-shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-sm text-white">{error}</div>
                    </div>
                  )}

                  {/* Email Input */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs sm:text-sm font-semibold text-white mb-2"
                    >
                      Email address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-white/70" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="block w-full pl-10 pr-4 py-3 sm:py-2.5 text-base sm:text-sm bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all touch-manipulation"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-white text-[#8ead5d] py-3.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-white/90 active:bg-white/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation min-h-[48px] text-base sm:text-sm flex-shrink-0 mt-5"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-[#8ead5d] border-t-transparent"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Back to Login Link */}
            <div className="text-center pt-4 border-t border-white/20">
              <p className="text-xs sm:text-sm text-white/90">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-white hover:text-white/80 transition-colors underline"
                >
                  Sign in
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
