import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TopBarProps {
	children: ReactNode;
	className?: string;
}

export const TopBar = ({ children, className }: TopBarProps) => {
	return (
		<>
			<div
				className={cn(
					"flex justify-between items-center fixed bg-[#F2F2F2] p-4 top-0 left-0 right-0 mx-auto z-50",
					className,
				)}
			>
				{children}
			</div>
			<div className="h-16" />
		</>
	);
};

interface TopBarLeftProps {
	children: ReactNode;
	className?: string;
}

export const TopBarLeft = ({ children, className }: TopBarLeftProps) => {
	return <div className={cn("", className)}>{children}</div>;
};

interface TopBarCenterProps {
	children: ReactNode;
	className?: string;
}

export const TopBarCenter = ({ children, className }: TopBarCenterProps) => {
	return (
		<div
			className={cn(
				"text-center absolute left-1/2 -translate-x-1/2",
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
	return <div className={cn("flex justify-end", className)}>{children}</div>;
};
