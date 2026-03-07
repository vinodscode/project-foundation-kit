import { IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";

export type LogoProps = {
  size?: "sm" | "md" | "lg";
  variant?: "horizontal" | "icon-only";
};

const Logo = ({ size = "md", variant = "horizontal" }: LogoProps) => {
  const sizes = {
    sm: { icon: 14, box: "w-7 h-7", text: "text-base" },
    md: { icon: 16, box: "w-8 h-8", text: "text-lg" },
    lg: { icon: 20, box: "w-10 h-10", text: "text-xl" },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <div className={cn("rounded-xl bg-blue-600 flex items-center justify-center", s.box)}>
        <IndianRupee size={s.icon} className="text-white" />
      </div>
      {variant === "horizontal" && (
        <span className={cn("font-bold tracking-tight text-foreground", s.text)}>Lendly</span>
      )}
    </div>
  );
};

export default Logo;
