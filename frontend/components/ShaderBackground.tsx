"use client";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const AnimatedShaderBackground = dynamic(
  () => import("@/components/ui/animated-shader-background"),
  { ssr: false }
);

const DASHBOARD_PREFIXES = ["/dashboard", "/upload", "/customers", "/profile", "/predictions"];

export const ShaderBackground = () => {
  const pathname = usePathname();
  const isDashboard = DASHBOARD_PREFIXES.some((p) => pathname.startsWith(p));

  if (isDashboard) return null;

  return <AnimatedShaderBackground />;
};
