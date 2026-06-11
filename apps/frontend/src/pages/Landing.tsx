
import { Page } from "@bilibay/ui";
import {
	ArrowRightIcon,
	ShieldCheckIcon,
	ShoppingBagIcon,
	TruckIcon
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { NavBar } from "~/components/common/NavBar";

function Landing() {
  return (
    <Page id="bilibay-landing" className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar />
      <div className="container-fluid mx-auto pb-safe-nav">
        {/* Hero Section */}
        <section className="py-12 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                  Discover Authentic <span className="text-[#98b964]">Filipino Products</span>
                </h1>
                <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0">
                  From traditional crafts to modern essentials, BiliBay brings the best of the Philippines right to your doorstep.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-8 py-4 bg-[#98b964] text-white font-semibold rounded-lg hover:bg-[#5e7142] transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Get Started
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/products"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200"
                  >
                    Browse Products
                  </Link>
                </div>
              </div>
              <div className="relative">
                <img
                  src="/bilibay-logo-rectangle.svg"
                  alt="BiliBay Logo"
                  className="w-full max-w-md mx-auto opacity-90"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
              Why Choose BiliBay?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-[#98b964]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBagIcon className="h-8 w-8 text-[#98b964]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Authentic Products
                </h3>
                <p className="text-gray-600">
                  Shop genuine Filipino products from trusted sellers across the country.
                </p>
              </div>
              <div className="text-center p-8 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-[#98b964]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TruckIcon className="h-8 w-8 text-[#98b964]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Fast & Reliable
                </h3>
                <p className="text-gray-600">
                  Quick delivery with our network of couriers and deliverers.
                </p>
              </div>
              <div className="text-center p-8 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-[#98b964]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="h-8 w-8 text-[#98b964]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Secure Shopping
                </h3>
                <p className="text-gray-600">
                  Safe and secure transactions with buyer protection guaranteed.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-[#98b964] to-[#5e7142]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Ready to Start Shopping?
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Join thousands of happy customers and discover amazing Filipino products today.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#98b964] font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Create Account
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      </div>
    </Page>
  );
}

export default Landing;
