// src/components/Icon.tsx
"use client";
import React from "react";

interface IconProps {
    name: string;          // Name of the icon file (without extension)
    alt?: string;         
    className?: string;  
}

const Icon = ({ name, alt = "", className = "w-6 h-6 " }: IconProps) => {
    return (
        <img
            src={`/Icons/${name}.svg`}  // Directly loads from public/Icons
            alt={alt || name}
            className={`${className}`}
        />
    );
};

export default Icon;
