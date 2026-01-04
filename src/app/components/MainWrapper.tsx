"use client";

import { usePathname } from "next/navigation";

export default function MainWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const mainClass = "flex-grow px-6 py-12 pt-0";
  const noPaddingRoutes = ["/add", "/admin", "/admin/add-car", "/login"];

  const shouldApplyClass = !noPaddingRoutes.includes(pathname);

  return (
    <main className={shouldApplyClass ? mainClass : ""}>
      {children}
    </main>
  );
}
