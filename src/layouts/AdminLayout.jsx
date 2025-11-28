import { Outlet } from "react-router-dom";
import SimpleNav from "../components/SimpleNav";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SimpleNav />
      <main className="p-6">
        <div className="max-w-5xl mx-auto bg-white rounded shadow p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
