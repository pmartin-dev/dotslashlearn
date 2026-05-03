import { createContext, useContext, useCallback, useEffect, useRef } from "react";

export type Zone = "sidebar" | "content";

interface KeyZoneContextValue {
  activeZone: Zone;
  setActiveZone: (zone: Zone) => void;
}

export const KeyZoneContext = createContext<KeyZoneContextValue>({
  activeZone: "content",
  setActiveZone: () => {},
});

export function useKeyZone() {
  return useContext(KeyZoneContext);
}

/**
 * Registers keyboard handlers only when the given zone is active.
 * Handlers receive the KeyboardEvent and should call preventDefault themselves.
 */
export function useZoneKeyboard(
  zone: Zone,
  handlers: Record<string, (e: KeyboardEvent) => void>,
) {
  const { activeZone } = useKeyZone();
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (activeZone !== zone) return;
      // Skip when modifier keys are held so we don't intercept native shortcuts (Cmd+C, etc.)
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const handler = handlersRef.current[e.key];
      if (handler) handler(e);
    },
    [activeZone, zone],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
