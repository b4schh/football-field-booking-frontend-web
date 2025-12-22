import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";

export default function DashboardLayout({ role }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        role={role} 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Header */}
        <DashboardHeader 
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Content */}
        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
