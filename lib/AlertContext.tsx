"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import AlertModal from "@/components/AlertModal";

type AlertContextType = {
  showAlert: (message: string) => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  // 이 함수를 밖에서 호출
  const showAlert = (msg: string) => {
    setMessage(msg);
    setIsOpen(true);
  };

  const closeAlert = () => {
    setIsOpen(false);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <AlertModal isOpen={isOpen} message={message} onClose={closeAlert} />
    </AlertContext.Provider>
  );
}

// hook
export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}
