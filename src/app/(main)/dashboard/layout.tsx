import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const layout: React.FC<LayoutProps> = ({ children }) => {
  return <main className="flex overflow-hidden h-screen">{children}</main>;
};

export default layout;
