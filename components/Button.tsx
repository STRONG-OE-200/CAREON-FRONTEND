"use client";
import React from "react";
import { twMerge } from "tailwind-merge";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export default function Button({
  children,
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  const baseStyle = "px-4 py-2 rounded-md font-bold";
  const variantStyle =
    variant === "primary" ? "bg-blue-500 text-white" : "bg-gray-200 text-black";

  const mergedClassName = twMerge(baseStyle, variantStyle, className);

  return (
    <button className={mergedClassName} type={type} {...props}>
      {children}
    </button>
  );
}
