import CustomerHeader from "../components/customer/CustomerHeader";
import CustomerFooter from "../components/customer/CustomerFooter";
import { Outlet } from "react-router-dom";

export default function CustomerLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CustomerHeader />

      <main className="flex-1">
        <Outlet />
      </main>

      <CustomerFooter />
    </div>
  );
}
