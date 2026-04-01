import { Link, useMatchRoute } from "@tanstack/react-router";
import {
  BanknoteArrowUp,
  ClipboardList,
  Home,
  type LucideIcon,
  MessageSquareWarning,
  ReceiptText,
  User,
  UserPlus,
} from "lucide-react";

type TabItem = {
  to: string;
  icon: LucideIcon;
  label: string;
};

type CenterAction = {
  to: string;
  icon: LucideIcon;
  label: string;
};

type TabBarConfig = {
  tabs: TabItem[];
  centerAction?: CenterAction;
};

const pemilikConfig: TabBarConfig = {
  tabs: [
    { to: "/pemilik", icon: Home, label: "Home" },
    { to: "/pemilik/tagihan", icon: ReceiptText, label: "Tagihan" },
    // 2 slots before center action
    { to: "/pemilik/informasi", icon: ClipboardList, label: "Informasi" },
    { to: "/pemilik/profile", icon: User, label: "Profile" },
  ],
  centerAction: {
    to: "/pemilik/penghuni/choose-room",
    icon: UserPlus,
    label: "Penghuni",
  },
};

const penghuniConfig: TabBarConfig = {
  tabs: [
    { to: "/penghuni", icon: Home, label: "Home" },
    { to: "/penghuni/tagihan", icon: ReceiptText, label: "Tagihan" },
    { to: "/penghuni/keluhan", icon: MessageSquareWarning, label: "Keluhan" },
    { to: "/penghuni/profile", icon: User, label: "Profile" },
  ],
  centerAction: {
    to: "/penghuni/perpanjang",
    icon: BanknoteArrowUp,
    label: "Perpanjang",
  },
};

export function TabBar({ config }: { config: TabBarConfig }) {
  const matchRoute = useMatchRoute();

  // Split tabs: 2 before center, 2 after center
  const leftTabs = config.tabs.slice(0, 2);
  const rightTabs = config.tabs.slice(2);

  return (
    <div
      data-tour="tabbar"
      className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-card md:rounded-t-md border-t md:border-r md:border-l"
    >
      <div className="grid grid-cols-5 items-center h-16 text-xs">
        {leftTabs.map((tab) => (
          <TabLink
            key={tab.to}
            to={tab.to}
            icon={<tab.icon size={20} />}
            label={tab.label}
            active={!!matchRoute({ to: tab.to })}
          />
        ))}

        {config.centerAction ? (
          <Link
            to={config.centerAction.to}
            className="flex flex-col items-center -mt-6 active:scale-95 transition-all"
          >
            <div className="bg-primary text-white p-4 rounded-full shadow-lg">
              <config.centerAction.icon size={24} />
            </div>
            <span className="mt-1 text-muted-foreground">
              {config.centerAction.label}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {rightTabs.map((tab) => (
          <TabLink
            key={tab.to}
            to={tab.to}
            icon={<tab.icon size={20} />}
            label={tab.label}
            active={!!matchRoute({ to: tab.to })}
          />
        ))}
      </div>
    </div>
  );
}

export function PemilikTabBar() {
  return <TabBar config={pemilikConfig} />;
}

export function PenghuniTabBar() {
  return <TabBar config={penghuniConfig} />;
}

function TabLink({
  icon,
  label,
  to,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center active:scale-95 transition-all ${
        active ? "text-primary" : "text-muted-foreground"
      }`}
    >
      {icon}
      <span className="mt-1">{label}</span>
    </Link>
  );
}
