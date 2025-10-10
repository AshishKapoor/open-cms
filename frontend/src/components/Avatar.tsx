import React from "react";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-16 h-16",
  };

  const iconSizes = {
    sm: "h-2 w-2",
    md: "h-4 w-4",
    lg: "h-5 w-5",
    xl: "h-8 w-8",
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizeClasses[size]} rounded-full object-cover ${
          size === "xl" ? "border-2 border-gray-200" : "border border-gray-200"
        } ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} bg-primary-100 rounded-full flex items-center justify-center ${className}`}
    >
      <User className={`${iconSizes[size]} text-primary-600`} />
    </div>
  );
};

export default Avatar;
