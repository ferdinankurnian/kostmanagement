import { Link } from "@tanstack/react-router";
import {
  Home,
  Megaphone,
  MessageCircleWarning,
  ScrollText,
  User,
  type LucideIcon,
} from "lucide-react";

export interface TabBarRoute {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

export const adminRoutes: TabBarRoute[] = [
  { to: "/admin", label: "Home", icon: Home, exact: true },
  { to: "/admin/tagihan", label: "Tagihan", icon: ScrollText },
  { to: "/admin/pengumuman", label: "Pengumuman", icon: Megaphone },
  { to: "/admin/profil", label: "Profil", icon: User },
];

export const memberRoutes: TabBarRoute[] = [
  { to: "/member", label: "Home", icon: Home, exact: true },
  { to: "/member/tagihan", label: "Tagihan", icon: ScrollText },
  { to: "/member/keluhan", label: "Keluhan", icon: MessageCircleWarning },
  { to: "/member/profil", label: "Profil", icon: User },
];

interface TabBarProps {
  routes: TabBarRoute[];
}

export const TabBar = ({ routes }: TabBarProps) => {
  const activeClass = "bg-primary text-black shadow-md";
  const inactiveClass = "bg-transparent text-white hover:bg-black/5";

  return (
    <>
      <div className="w-full h-20 fixed left-0 right-0 bottom-0 bg-gradient-to-t from-[#F2F2F2] to-transparent pointer-events-none"></div>
      <nav className="max-w-xl flex justify-center items-center fixed bottom-4 left-4 right-4 mx-auto z-50 scale-110 origin-bottom">
        <div className="flex items-center gap-2 p-2 rounded-full bg-black/60 backdrop-blur-md border border-black/20 shadow-xl">
          {routes.map((route) => (
            <Link
              key={route.to}
              to={route.to}
              activeOptions={{ exact: route.exact }}
              activeProps={{ className: activeClass }}
              inactiveProps={{ className: inactiveClass }}
              className="h-12 transition-all duration-300 ease-out flex items-center overflow-hidden rounded-full"
            >
              {({ isActive }) => (
                <div
                  className={`flex items-center transition-all duration-300 ease-out ${
                    isActive ? "px-5 w-auto" : "w-12 px-0 justify-center"
                  }`}
                >
                  <route.icon size={20} />
                  <span
                    className={`text-xs transition-all duration-300 ease-out whitespace-nowrap overflow-hidden ${
                      isActive
                        ? "opacity-100 ml-2 max-w-[100px]"
                        : "opacity-0 max-w-0 ml-0"
                    }`}
                  >
                    {route.label}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export const AdminNavbar = () => <TabBar routes={adminRoutes} />;
export const MemberNavbar = () => <TabBar routes={memberRoutes} />;
