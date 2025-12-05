import {useState, useEffect} from "react";
import {Card, Dropdown} from "@bilibay/ui";

function ProductsSection({products}: {products: any[]}) {
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [category, setCategory] = useState("all");

  // Get unique categories from products
  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  useEffect(() => {
    if (category === "all") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter((p) => p.category === category));
    }
  }, [category, products]);

  return (
    <section>
      <div className="mb-6 flex justify-end">
        <p className="mr-4 mt-3 text-[#98b964]">Categories</p>
        <Dropdown
          label=""
          options={categories}
          selected={category}
          onSelect={setCategory}
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col"
          >
            {/* Product Image */}
            <img
              src={product.thumbnail}
              alt={product.title}
              className="h-52 w-full object-cover transition-transform duration-300 hover:scale-105"
            />

            {/* Product Info */}
            <div className="bg-gray-100 p-4 flex flex-col justify-between flex-1">
              <div>
                <h3 className="font-bold text-lg text-gray-700 line-clamp-1">
                  {product.title}
                </h3>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {product.description}
                </p>
              </div>

              <div className="mt-3 flex justify-between items-center">
                <p className="font-semibold text-gray-700 text-lg">
                  ${product.price}
                </p>
                <div className="flex gap-2 w-60">
                  <button className="flex-1 bg-white border border-[#98b964] shadow-sm text-[#98b964] px-3 py-1 rounded-md font-medium hover:bg-green-800 hover:text-white transition">
                    Add to Cart
                  </button>
                  <button className="flex-1 bg-[#98b964] shadow-sm text-white px-3 py-1 rounded-md font-medium hover:bg-green-800 transition">
                    Buy
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default ProductsSection;
