import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TopBarProps {
  children: ReactNode;
  className?: string;
}

export const TopBar = ({ children, className }: TopBarProps) => {
  return (
    <div
      className={cn(
        "max-w-lg mx-auto grid grid-cols-3 items-center fixed bg-white/40 backdrop-blur-md p-4 top-0 right-0 left-0 z-50",
        className,
      )}
    >
      {children}
    </div>
  );
};

interface TopBarLeftProps {
  children: ReactNode;
  className?: string;
}

export const TopBarLeft = ({ children, className }: TopBarLeftProps) => {
  return (
    <div className={cn("flex items-center col-start-1 col-end-2", className)}>
      {children}
    </div>
  );
};

interface TopBarCenterProps {
  children: ReactNode;
  className?: string;
}

export const TopBarCenter = ({ children, className }: TopBarCenterProps) => {
  return (
    <div
      className={cn(
        "flex justify-center items-center col-start-2 col-end-3",
        className,
      )}
    >
      {children}
    </div>
  );
};

interface TopBarRightProps {
  children: ReactNode;
  className?: string;
}

export const TopBarRight = ({ children, className }: TopBarRightProps) => {
  return (
    <div
      className={cn(
        "flex justify-end items-center col-start-3 col-end-4",
        className,
      )}
    >
      {children}
    </div>
  );
};
