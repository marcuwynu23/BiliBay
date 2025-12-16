import {Page} from "@bilibay/ui";
import {useState, useEffect} from "react";
import {NavBar} from "~/components/common/NavBar";
import ProductsSection from "~/components/common/ProductsSection";
import {api} from "~/utils/api";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

function Home() {
  // Slider content: promo banners with text
  const slides = [
    {
      title: "🔥 Limited Time: 70% OFF Flash Sale!",
      subtitle: "Ends in 24 hours - Don't miss out on authentic Filipino products",
      bgColor: "#98b964",
    },
    {
      title: "⚡ Free Shipping on Orders $50+",
      subtitle: "Plus get 10% cashback on your first purchase - Join 10,000+ happy customers",
      bgColor: "#98b964",
    },
    {
      title: "🎁 Buy 2 Get 1 FREE Today Only!",
      subtitle: "Stock is limited - Only 50 items left at this price",
      bgColor: "#98b964",
    },
    {
      title: "⭐ Top Rated: 4.9/5 Stars",
      subtitle: "Over 5,000 verified reviews - Shop with confidence",
      bgColor: "#98b964",
    },
    {
      title: "💰 Save Up to $200 This Week",
      subtitle: "Exclusive deals on premium Filipino products - Limited quantities available",
      bgColor: "#98b964",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState([]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  // Auto-slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.get("/buyer/products?limit=12");
        setProducts(data.products || []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []);

  return (
    <Page id="bilibay-home" className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar />
      <div className="container-fluid mx-auto  pb-safe">
        {/* Top Slider */}
        <section className="relative overflow-hidden shadow-lg">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{transform: `translateX(-${currentSlide * 100}%)`}}
          >
            {slides.map((slide, index) => (
              <div
                key={index}
                className="w-full flex-shrink-0 min-h-[120px] h-auto sm:h-40 md:h-48 flex flex-col justify-center items-center text-white text-center px-3 sm:px-4 md:px-6 py-4 sm:py-0 relative"
                style={{backgroundColor: slide.bgColor}}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>
                <div className="relative z-10 w-full max-w-4xl">
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                    <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 flex-shrink-0" />
                    <h2 className="text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl font-extrabold drop-shadow-lg leading-tight sm:leading-normal px-1">
                      {slide.title}
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg font-medium drop-shadow leading-relaxed sm:leading-normal px-2 sm:px-0">
                    {slide.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Slider buttons */}
          <button
            onClick={prevSlide}
            className="hidden absolute top-1/2 left-2 sm:left-3 -translate-y-1/2 bg-transparent text-white p-1.5 sm:p-2"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={nextSlide}
            className="hidden absolute top-1/2 right-2 sm:right-3 -translate-y-1/2 bg-transparent text-white p-1.5 sm:p-2"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          {/* Slider indicators */}
          <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 touch-manipulation ${
                  index === currentSlide
                    ? "w-6 sm:w-8 bg-white"
                    : "w-1.5 sm:w-2 bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </section>

        <ProductsSection products={products} />
      </div>
    </Page>
  );
}

export default Home;
