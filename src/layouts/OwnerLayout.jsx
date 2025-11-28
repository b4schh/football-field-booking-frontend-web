import { Outlet } from "react-router-dom";
import SimpleNav from "../components/SimpleNav";

export default function OwnerLayout() {
  return (
    <div className="min-h-screen bg-amber-50">
      <SimpleNav />
      <main className="p-6">
        <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
