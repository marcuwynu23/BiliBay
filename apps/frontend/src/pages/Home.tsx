import {Page} from "@bilibay/ui";

function Home() {
  return (
    <Page id="page-1" className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Users List</h1>

      <div className="overflow-x-auto shadow-md rounded-lg bg-white"></div>
    </Page>
  );
}

export default Home;
