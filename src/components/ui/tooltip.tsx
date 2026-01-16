import * as TooltipPrimitive from "@radix-ui/react-tooltip";

export function Tooltip({ children }: { children: React.ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>{children}</TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({ children }: { children: React.ReactNode }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        side="right"
        align="start"
        sideOffset={8}
        className="z-50 max-w-xs rounded-lg border border-gray-200 bg-white px-3 py-2.5 shadow-lg text-xs text-gray-700 animate-in fade-in-0 zoom-in-95"
      >
        {children}
        <TooltipPrimitive.Arrow className="fill-gray-200" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}
