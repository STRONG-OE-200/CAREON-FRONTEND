import React from "react";
import { twMerge } from "tailwind-merge";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className }: CardProps) {
  const baseStyle = "rounded-lg border border-gray-200 bg-white p-4 shadow-sm";
  const mergedClassName = twMerge(baseStyle, className);

  return <div className={mergedClassName}>{children}</div>;
}
