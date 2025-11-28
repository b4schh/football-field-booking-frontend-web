import SearchBar from "../components/customer/SearchBar";
import FeaturedCards from "../components/customer/FeaturedCards";
import ComplexListGrid from "../components/customer/ComplexListGrid";
import api from "../services/api.js";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <SearchBar />
        <FeaturedCards />
        <ComplexListGrid />
      </main>
    </div>
  );
}
