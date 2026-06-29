import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import SideBar from "../components/SideBar/SideBar";
import Header from "../components/Header/Header";
import AuthInit from "../components/AuthInit";
import ChatWidget from "../components/Chat/ChatWidget";

const AppShell = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { userDetails } = useSelector((state) => state.auth);
  const userRole = userDetails?.role || null;

  return (
    <AuthInit>
      <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-200">
        <SideBar isCollapsed={isCollapsed} />

        <div className="flex flex-col flex-1 min-w-0 bg-background transition-colors duration-200">
          <Header isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

          <main className="flex-1 overflow-auto py-4 px-6 bg-gray-100 transition-colors duration-200">
            <div className="h-full w-full">
              <Outlet context={{ userRole }} />
            </div>
          </main>
        </div>

        <ChatWidget />
      </div>
    </AuthInit>
  );
};

export default AppShell;
