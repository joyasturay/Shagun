import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  href = "/",
  size = "default",
}: {
  className?: string;
  href?: string;
  size?: "default" | "lg";
}) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 group", className)}>
      <span
        className={cn(
          "font-light tracking-tight text-forest-depths",
          size === "lg" ? "text-2xl" : "text-lg"
        )}
      >
        Shagun
        <span className="text-pewter">.ai</span>
      </span>
      <span className="h-2 w-2 rounded-full bg-lime-pulse" aria-hidden />
    </Link>
  );
}
