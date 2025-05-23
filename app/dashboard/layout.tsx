import Header from "@/components/Header";
import { ClerkLoaded } from "@clerk/nextjs";
import React from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkLoaded>
      <div className="min-h-screen bg-slate-50">
        <Header />

        <main>{children}</main>
      </div>
    </ClerkLoaded>
  );
};

export default DashboardLayout;
