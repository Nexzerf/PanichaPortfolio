import Image from "next/image";
import logo from "../../public/logo.png";

/** The site's "P" mark. Decorative by default — pair it with visible text (the brand name). */
export function Logo({ size = 28, className = "", alt = "" }: { size?: number; className?: string; alt?: string }) {
  return (
    <Image
      src={logo}
      alt={alt}
      width={size}
      height={size}
      sizes={`${size}px`}
      className={`shrink-0 select-none drop-shadow-[0_0_10px_rgb(59_107_255/0.45)] ${className}`}
      draggable={false}
    />
  );
}
