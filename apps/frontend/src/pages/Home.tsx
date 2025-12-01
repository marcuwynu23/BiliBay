import {Page} from "@bilibay/ui";

function Home() {
  return (
    <Page
      id="bilibay-home"
      className="min-h-screen p-6 bg-[#f8f8f8]" // secondary
    >
      {/* Header */}
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold text-[#98b964]">BiliBay</h1>
        <p className="mt-2 text-gray-700 text-lg">
          Buy and sell Filipino products easily
        </p>
      </header>

      {/* Products Section */}
      <section>
        <h2 className="text-3xl font-semibold mb-6 text-[#6D9729]">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {/* Example product cards */}
          <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
            <div className="h-52 bg-gray-200 rounded mb-4" />
            <h3 className="font-bold text-xl text-gray-800">Product 1</h3>
            <p className="text-gray-600 mt-2">
              High-quality Filipino-made product 1
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
            <div className="h-52 bg-gray-200 rounded mb-4" />
            <h3 className="font-bold text-xl text-gray-800">Product 2</h3>
            <p className="text-gray-600 mt-2">
              High-quality Filipino-made product 2
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
            <div className="h-52 bg-gray-200 rounded mb-4" />
            <h3 className="font-bold text-xl text-gray-800">Product 3</h3>
            <p className="text-gray-600 mt-2">
              High-quality Filipino-made product 3
            </p>
          </div>
        </div>
      </section>
    </Page>
  );
}

export default Home;
