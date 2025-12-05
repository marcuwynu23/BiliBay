import {Page} from "@bilibay/ui";
import {useState, useEffect} from "react";
import {NavBar} from "~/components/common/NavBar";
import ProductsSection from "./Product";

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

  // Fetch products from DummyJSON
  useEffect(() => {
    fetch("https://dummyjson.com/products?limit=12")
      .then((res) => res.json())
      .then((data) => setProducts(data.products))
      .catch((err) => console.error(err));
  }, []);

  return (
    <Page id="bilibay-home" className="min-h-screen p-2 bg-[#f8f8f8]">
      <NavBar />
      {/* Top Slider */}
      <section className="relative mb-12 overflow-hidden rounded-lg shadow-lg">
        <div
          className="flex transition-transform duration-500"
          style={{transform: `translateX(-${currentSlide * 100}%)`}}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0 h-64 sm:h-80 md:h-96 flex flex-col justify-center items-center text-white text-center px-6"
              style={{backgroundColor: slide.bgColor}}
            >
              <h2 className="text-4xl sm:text-4xl md:text-7xl font-bold mb-2">
                {slide.title}
              </h2>
              <p className="text-lg sm:text-xl md:text-3xl">{slide.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Slider buttons */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/70 p-2 rounded-full shadow hover:bg-white"
        >
          &#10094;
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/70 p-2 rounded-full shadow hover:bg-white"
        >
          &#10095;
        </button>
      </section>

      <ProductsSection products={products} />
    </Page>
  );
}

export default Home;
