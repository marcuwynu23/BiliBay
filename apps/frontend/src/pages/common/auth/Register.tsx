import {useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import {useAuthStore} from "~/stores/common/authStore";
import {Page, Select} from "@bilibay/ui";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
  UserGroupIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  HomeIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import IllustrationBackground from "~/components/common/IllustrationBackground";
import bilibayLogo from "~/assets/icons/bilibay-logo-rectangle-light.svg";

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    birthday: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer" as "buyer" | "seller",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {register} = useAuthStore();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({...formData, [e.target.name]: e.target.value});
    setError(""); // Clear error when user types
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (currentStep === 1) {
      // Validate step 1 fields (name fields only)
      if (!formData.firstName.trim()) {
        setError("First name is required");
        return;
      }

      if (!formData.lastName.trim()) {
        setError("Last name is required");
        return;
      }

      // Step 1 validation passed, move to step 2
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate step 2 fields (birthday, email, phone)
      if (!formData.email.trim()) {
        setError("Email address is required");
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address");
        return;
      }

      // Step 2 validation passed, move to step 3
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await register(
        formData.firstName,
        formData.middleName || undefined,
        formData.lastName,
        formData.birthday || undefined,
        formData.email,
        formData.password,
        formData.role,
        formData.phone || undefined
      );
      setTimeout(() => {
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          navigate(
            currentUser.role === "admin"
              ? "/admin/dashboard"
              : currentUser.role === "seller"
              ? "/seller/dashboard"
              : "/buyer/dashboard"
          );
        }
      }, 100);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
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
      <div className="w-full md:w-1/2  bg-[#8ead5e]  flex items-center justify-center min-h-screen md:min-h-0 py-0 md:py-12 px-0 md:px-8 lg:px-12 relative z-10">
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
                Create Your Account
              </h2>
              <p className="text-sm sm:text-base text-white/90">
                {currentStep === 1 
                  ? "Step 1 of 3: Personal Information" 
                  : currentStep === 2 
                  ? "Step 2 of 3: Contact Information" 
                  : "Step 3 of 3: Account Setup"}
              </p>
              {/* Progress Indicator */}
              <div className="mt-4 flex justify-center gap-2">
                <div className={`h-1.5 w-12 rounded-full transition-all ${currentStep >= 1 ? 'bg-white' : 'bg-white/30'}`}></div>
                <div className={`h-1.5 w-12 rounded-full transition-all ${currentStep >= 2 ? 'bg-white' : 'bg-white/30'}`}></div>
                <div className={`h-1.5 w-12 rounded-full transition-all ${currentStep >= 3 ? 'bg-white' : 'bg-white/30'}`}></div>
              </div>
            </div>

            {currentStep === 1 ? (
              <form className="flex-1 flex flex-col min-h-0" onSubmit={handleNext}>
                <div className="flex-1 overflow-y-auto -webkit-overflow-scrolling-touch space-y-5">
                  {error && (
                    <div className="rounded-lg bg-red-500/20 backdrop-blur-sm border border-red-300/50 p-4 flex items-start gap-3">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-200 flex-shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-sm text-white">{error}</div>
                    </div>
                  )}

                  {/* First Name */}
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-xs sm:text-sm font-semibold text-white mb-2"
                    >
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-white/70" />
                      </div>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        className="block w-full pl-10 pr-4 py-3 sm:py-2.5 text-base sm:text-sm bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all touch-manipulation"
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Middle Name */}
                  <div>
                    <label
                      htmlFor="middleName"
                      className="block text-xs sm:text-sm font-semibold text-white mb-2"
                    >
                      Middle Name{" "}
                      <span className="text-white/70 font-normal text-xs sm:text-sm">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-white/70" />
                      </div>
                      <input
                        id="middleName"
                        name="middleName"
                        type="text"
                        className="block w-full pl-10 pr-4 py-3 sm:py-2.5 text-base sm:text-sm bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all touch-manipulation"
                        placeholder="Enter your middle name"
                        value={formData.middleName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-xs sm:text-sm font-semibold text-white mb-2"
                    >
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-white/70" />
                      </div>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        className="block w-full pl-10 pr-4 py-3 sm:py-2.5 text-base sm:text-sm bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all touch-manipulation"
                        placeholder="Enter your last name"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                </div>

                {/* Next Button */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-white text-[#8ead5d] py-3.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-white/90 active:bg-white/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation min-h-[48px] text-base sm:text-sm flex-shrink-0 mt-5"
                >
                  <span>Next</span>
                  <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </form>
            ) : currentStep === 2 ? (
              <form className="flex-1 flex flex-col min-h-0" onSubmit={handleNext}>
                <div className="flex-1 overflow-y-auto -webkit-overflow-scrolling-touch space-y-5">
                  {error && (
                    <div className="rounded-lg bg-red-500/20 backdrop-blur-sm border border-red-300/50 p-4 flex items-start gap-3">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-200 flex-shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-sm text-white">{error}</div>
                    </div>
                  )}

                  {/* Birthday */}
                  <div>
                    <label
                      htmlFor="birthday"
                      className="block text-xs sm:text-sm font-semibold text-white mb-2"
                    >
                      Birthday{" "}
                      <span className="text-white/70 font-normal text-xs sm:text-sm">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon className="h-5 w-5 text-white/70" />
                      </div>
                      <input
                        id="birthday"
                        name="birthday"
                        type="date"
                        className="block w-full pl-10 pr-4 py-3 sm:py-2.5 text-base sm:text-sm bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all touch-manipulation"
                        value={formData.birthday}
                        onChange={handleChange}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  {/* Email */}
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
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs sm:text-sm font-semibold text-white mb-2"
                    >
                      Phone Number{" "}
                      <span className="text-white/70 font-normal text-xs sm:text-sm">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhoneIcon className="h-5 w-5 text-white/70" />
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        className="block w-full pl-10 pr-4 py-3 sm:py-2.5 text-base sm:text-sm bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all touch-manipulation"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-5">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 flex items-center justify-center gap-2 border-2 border-white/30 text-white py-3.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-white/10 active:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 transition-all duration-200 touch-manipulation min-h-[48px] text-base sm:text-sm"
                  >
                    <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 bg-white text-[#8ead5d] py-3.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-white/90 active:bg-white/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation min-h-[48px] text-base sm:text-sm"
                  >
                    <span>Next</span>
                    <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </form>
            ) : (
              <form className="flex-1 flex flex-col min-h-0" onSubmit={handleSubmit}>
                <div className="flex-1 overflow-y-auto -webkit-overflow-scrolling-touch space-y-5">
                  {error && (
                    <div className="rounded-lg bg-red-500/20 backdrop-blur-sm border border-red-300/50 p-4 flex items-start gap-3">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-200 flex-shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-sm text-white">{error}</div>
                    </div>
                  )}

                  {/* Account Type */}
                  <div>
                    <label
                      htmlFor="role"
                      className="block text-xs sm:text-sm font-semibold text-white mb-2"
                    >
                      Account Type
                    </label>
                    <Select
                      id="role"
                      name="role"
                      required
                      value={formData.role}
                      onChange={handleChange}
                      options={[
                        {value: "buyer", label: "Buyer"},
                        {value: "seller", label: "Seller"},
                      ]}
                      leftIcon={<UserGroupIcon className="h-5 w-5 text-white/70" />}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-xs sm:text-sm font-semibold text-white mb-2"
                    >
                      Password
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
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70 hover:text-white transition-colors"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-white/70">
                      Must be at least 6 characters
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs sm:text-sm font-semibold text-white mb-2"
                    >
                      Confirm Password
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
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70 hover:text-white transition-colors"
                        aria-label={
                          showConfirmPassword ? "Hide password" : "Show password"
                        }
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

                {/* Action Buttons */}
                <div className="flex gap-3 mt-5">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 flex items-center justify-center gap-2 border-2 border-white/30 text-white py-3.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-white/10 active:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 transition-all duration-200 touch-manipulation min-h-[48px] text-base sm:text-sm"
                  >
                    <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-white text-[#8ead5d] py-3.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-white/90 active:bg-white/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation min-h-[48px] text-base sm:text-sm"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-[#8ead5d] border-t-transparent"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <span>Create account</span>
                        <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-white/20">
              <p className="text-xs sm:text-sm text-white/90">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-white hover:text-white/80 transition-colors underline"
                >
                  Sign in here
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
