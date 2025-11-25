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
  const baseStyle = "px-4 py-2 rounded-2xl shadow";
  const variantStyle =
    variant === "primary"
      ? "bg-sub-purple border border-[#f2f2f2] rounded-4xl"
      : "bg-btn-white border border-[#f2f2f2] shadow shadow-bg-purple rounded-4xl";

  const mergedClassName = twMerge(baseStyle, variantStyle, className);

  return (
    <button className={mergedClassName} type={type} {...props}>
      {children}
    </button>
  );
}
