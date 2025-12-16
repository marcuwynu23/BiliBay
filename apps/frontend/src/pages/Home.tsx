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
      title: "Welcome to BiliBay!",
      subtitle: "Buy and sell Filipino products easily",
      bgColor: "#98b964",
    },
    {
      title: "Big Sale Today!",
      subtitle: "Up to 50% off on selected items",
      bgColor: "#98b964",
    },
    {
      title: "Free Shipping",
      subtitle: "On all orders over $50",
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
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8 pb-safe">
        {/* Top Slider */}
        <section className="relative mb-8 sm:mb-12 md:mb-16 overflow-hidden rounded-xl sm:rounded-2xl shadow-xl">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{transform: `translateX(-${currentSlide * 100}%)`}}
          >
            {slides.map((slide, index) => (
              <div
                key={index}
                className="w-full flex-shrink-0 h-64 sm:h-80 md:h-96 lg:h-[500px] flex flex-col justify-center items-center text-white text-center px-6 relative"
                style={{backgroundColor: slide.bgColor}}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <SparklesIcon className="h-8 w-8 sm:h-10 sm:w-10" />
                    <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold mb-3 drop-shadow-lg">
                      {slide.title}
                    </h2>
                  </div>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium drop-shadow">
                    {slide.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Slider buttons */}
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-2 sm:left-4 -translate-y-1/2 bg-white/90 text-[#98b964] p-2 sm:p-3 rounded-full shadow-lg hover:bg-white transition-all duration-200 hover:scale-110 z-20"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-2 sm:right-4 -translate-y-1/2 bg-white/90 text-[#98b964] p-2 sm:p-3 rounded-full shadow-lg hover:bg-white transition-all duration-200 hover:scale-110 z-20"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Slider indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "w-8 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/75"
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
