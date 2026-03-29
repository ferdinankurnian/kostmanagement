import { Link, type LinkComponent } from "@tanstack/react-router";
import { ChevronRight, type LucideIcon } from "lucide-react";

export function MenuList({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card/70">
      {children}
    </div>
  );
}

type MenuListItemProps = {
  icon: LucideIcon;
  label: string;
  to?: string;
  onClick?: () => void;
};

export function MenuListItem({
  icon: Icon,
  label,
  to,
  onClick,
}: MenuListItemProps) {
  const content = (
    <>
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-foreground" />
        </div>
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <ChevronRight className="h-4 w-4 mr-2 text-muted-foreground" />
    </>
  );

  const className =
    "flex w-full items-center justify-between border-t first:border-t-0 px-2 py-2 hover:bg-muted/50 active:bg-muted/70";

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}
