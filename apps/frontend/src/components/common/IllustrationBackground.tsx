import {useState, useEffect} from "react";
import onlineShopping from "~/assets/illustrations/online-shopping.svg";
import shopping from "~/assets/illustrations/shopping.svg";
import addToCard from "~/assets/illustrations/add-to-card.svg";
import deliveries from "~/assets/illustrations/deliveries.svg";
import paymentWithCreditCard from "~/assets/illustrations/payment-with-credit-card.svg";
import mobilePayments from "~/assets/illustrations/mobile-payments.svg";
import wishlist from "~/assets/illustrations/wishlist.svg";
import webShopping from "~/assets/illustrations/web-shopping.svg";

// BiliBay feature illustrations with descriptions
const bilibayFeatures = [
  {
    illustration: onlineShopping,
    title: "Shop Anytime, Anywhere",
    description: "Browse and purchase Filipino products from the comfort of your home",
  },
  {
    illustration: shopping,
    title: "Wide Product Selection",
    description: "Discover thousands of authentic Filipino products and local favorites",
  },
  {
    illustration: addToCard,
    title: "Easy Shopping Experience",
    description: "Add items to your cart with just one click and checkout seamlessly",
  },
  {
    illustration: deliveries,
    title: "Fast & Reliable Delivery",
    description: "Get your orders delivered quickly and safely to your doorstep",
  },
  {
    illustration: paymentWithCreditCard,
    title: "Secure Payments",
    description: "Multiple payment options with bank-level security for your peace of mind",
  },
  {
    illustration: mobilePayments,
    title: "Mobile-Friendly",
    description: "Shop on the go with our mobile-optimized platform",
  },
  {
    illustration: wishlist,
    title: "Save Your Favorites",
    description: "Create wishlists and save products you love for later",
  },
  {
    illustration: webShopping,
    title: "Seamless Online Experience",
    description: "Enjoy a smooth and intuitive shopping experience across all devices",
  },
];

interface IllustrationBackgroundProps {
  className?: string;
  isMobile?: boolean;
}

export default function IllustrationBackground({className = ""}: IllustrationBackgroundProps) {
  const [currentFeature, setCurrentFeature] = useState<number>(0);

  // Randomly select initial feature
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * bilibayFeatures.length);
    setCurrentFeature(randomIndex);
  }, []);

  // Cycle through features every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % bilibayFeatures.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const feature = bilibayFeatures[currentFeature];

  return (
    <div className={`${className} relative overflow-hidden bg-[#fefefe]`}>
      {/* Illustration */}
      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
        <img
          src={feature.illustration}
          alt={feature.title}
          className="w-full h-full object-contain max-w-2xl transition-opacity duration-500"
          onError={() => {
            // Fallback to next illustration if current one fails to load
            const nextIndex = (currentFeature + 1) % bilibayFeatures.length;
            setCurrentFeature(nextIndex);
          }}
        />
      </div>

      {/* Feature Description - Desktop Only */}
      <div className="hidden md:block absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#637c3c]/60 via-[#637c3c]/40 to-transparent">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-white mb-2">{feature.title}</h3>
          <p className="text-base text-white/90">{feature.description}</p>
        </div>
      </div>
    </div>
  );
}

