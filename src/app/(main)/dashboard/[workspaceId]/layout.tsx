import Sidebar from "@/components/sidebar/sidebar";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

const layout: React.FC<LayoutProps> = ({ children, params }) => {
  return (
    <main>
      <Sidebar params={params} />
      mobilesidebar
      <div>{children}</div>
    </main>
  );
};

export default layout;
