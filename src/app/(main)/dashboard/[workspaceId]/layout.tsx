import Sidebar from "@/components/sidebar/sidebar";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

const layout: React.FC<LayoutProps> = ({ children, params }) => {
  return (
    <main className="flex overflow-hidden h-screen w-screen">
      <Sidebar params={params} />
      <div>{children}</div>
    </main>
  );
};

export default layout;
