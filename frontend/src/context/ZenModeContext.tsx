import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface ZenModeContextType {
  isZenMode: boolean;
  setZenMode: (enabled: boolean) => void;
  toggleZenMode: () => void;
}

const ZenModeContext = createContext<ZenModeContextType | undefined>(undefined);

export const useZenMode = (): ZenModeContextType => {
  const context = useContext(ZenModeContext);
  if (!context) {
    throw new Error("useZenMode must be used within a ZenModeProvider");
  }
  return context;
};

interface ZenModeProviderProps {
  children: ReactNode;
}

export const ZenModeProvider: React.FC<ZenModeProviderProps> = ({
  children,
}) => {
  const [isZenMode, setIsZenMode] = useState(false);

  const setZenMode = (enabled: boolean) => {
    setIsZenMode(enabled);
  };

  const toggleZenMode = () => {
    setIsZenMode(!isZenMode);
  };

  return (
    <ZenModeContext.Provider value={{ isZenMode, setZenMode, toggleZenMode }}>
      {children}
    </ZenModeContext.Provider>
  );
};
