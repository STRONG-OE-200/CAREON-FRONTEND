"use client";
import React from "react";
import { twMerge } from "tailwind-merge";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className, ...props }: InputProps) {
  const baseStyle =
    "w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  const mergedClassName = twMerge(baseStyle, className);

  return <input className={mergedClassName} {...props} />;
}
