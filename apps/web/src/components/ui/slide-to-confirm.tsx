import { Check, ChevronRight } from "lucide-react";
import * as React from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface SlideToConfirmProps {
  onConfirm: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  text?: string;
  className?: string;
}

export function SlideToConfirm({
  onConfirm,
  isLoading = false,
  disabled = false,
  text = "Slide untuk konfirmasi",
  className,
}: SlideToConfirmProps) {
  const [dragOffset, setDragOffset] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const handleRef = React.useRef<HTMLDivElement>(null);
  const startXRef = React.useRef<number>(0);
  const confirmedRef = React.useRef(false);

  const isDisabled = disabled || isLoading;

  // Reset confirmed state if isLoading turns false after being confirmed
  // (e.g. error during submission)
  React.useEffect(() => {
    if (!isLoading && isConfirmed) {
      // If we want to allow retry after error, we might reset here
      // But for now, let's just keep it simple.
    }
  }, [isLoading]);

  const getMaxOffset = () => {
    if (!containerRef.current || !handleRef.current) return 0;
    return (
      containerRef.current.offsetWidth - handleRef.current.offsetWidth - 16
    );
  };

  const handleStart = (clientX: number) => {
    if (confirmedRef.current || isDisabled) return;
    setIsDragging(true);
    startXRef.current = clientX - dragOffset;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || confirmedRef.current || isDisabled) return;
    const maxOffset = getMaxOffset();
    let newOffset = clientX - startXRef.current;
    newOffset = Math.max(0, Math.min(newOffset, maxOffset));
    setDragOffset(newOffset);
  };

  const confirm = () => {
    if (confirmedRef.current || isDisabled) return;
    const maxOffset = getMaxOffset();
    setDragOffset(maxOffset);
    setIsConfirmed(true);
    setIsDragging(false);
    confirmedRef.current = true;
    onConfirm();
  };

  const handleEnd = () => {
    if (confirmedRef.current || isDisabled) return;
    setIsDragging(false);
    const maxOffset = getMaxOffset();
    // More forgiving threshold (90%) for release
    if (dragOffset >= maxOffset * 0.9) {
      confirm();
    } else {
      setDragOffset(0);
    }
  };

  React.useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const onMouseUp = () => handleEnd();
    const onTouchEnd = () => handleEnd();

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("touchend", onTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDragging, dragOffset]);

  const maxOffset = getMaxOffset();
  const currentOffset = isConfirmed || isLoading ? maxOffset : dragOffset;
  const progress = maxOffset > 0 ? currentOffset / maxOffset : 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex h-16 w-full items-center rounded-full bg-secondary p-2 overflow-hidden select-none transition-opacity duration-200",
        isDisabled && "opacity-80 pointer-events-none",
        className,
      )}
    >
      <div
        className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none transition-opacity duration-200"
        style={{
          opacity: Math.max(0, 1 - progress * 1.5),
        }}
      >
        <span className="text-sm font-medium tracking-wide">
          {isLoading ? "Memproses..." : text}
        </span>
      </div>

      <div
        ref={handleRef}
        onMouseDown={(e) => handleStart(e.clientX)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        className={cn(
          "relative z-10 flex h-12 w-12 cursor-grab items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm active:cursor-grabbing transition-colors duration-300",
          !isDragging && "transition-all duration-300 ease-in-out",
          (isConfirmed || isLoading) && "bg-green-500 cursor-default",
          disabled &&
            !isLoading &&
            "bg-muted text-muted-foreground cursor-not-allowed",
        )}
        style={{
          transform: `translateX(${currentOffset}px)`,
        }}
      >
        {isLoading ? (
          <Spinner className="size-6 text-primary-foreground" />
        ) : isConfirmed ? (
          <Check className="size-6 scale-110" />
        ) : (
          <ChevronRight className="size-6 transition-transform" />
        )}
      </div>
    </div>
  );
}
