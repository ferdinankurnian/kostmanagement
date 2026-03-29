import { type DriveStep, driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useCallback } from "react";

export interface TourStep {
  element: string;
  popover: {
    title: string;
    description: string;
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
  };
}

interface UseTourOptions {
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
}

export function useTour({ steps, onComplete, onSkip }: UseTourOptions) {
  const start = useCallback(() => {
    const driveSteps: DriveStep[] = steps.map((step) => ({
      element: step.element,
      popover: {
        title: step.popover.title,
        description: step.popover.description,
        side: step.popover.side ?? "bottom",
        align: step.popover.align ?? "start",
        showButtons: ["next", "previous", "close"],
        nextBtnText: "Lanjut",
        prevBtnText: "Kembali",
      },
    }));

    const driverObj = driver({
      showProgress: true,
      steps: driveSteps,
      onDestroyed: () => {
        onComplete?.();
      },
      onCloseClick: () => {
        driverObj.destroy();
        onSkip?.();
      },
      overlayColor: "rgba(0, 0, 0, 0.5)",
      allowClose: true,
      smoothScroll: true,
    });

    driverObj.drive();
  }, [steps, onComplete, onSkip]);

  return { start };
}
