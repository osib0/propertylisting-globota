'use client';

import { useAppContext } from "@/app/contextapi";
import { redirect } from "next/navigation";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAprove } = useAppContext();

  if (!isAprove) {
    redirect('/dashboard')
  }

  return (
    <main className="bg-[#fafafa] w-full">
      {children}
    </main>
  );
}
