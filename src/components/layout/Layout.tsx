import { FC, ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Footer, Navbar } from "../../utils/componentImports";

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col w-max md:w-full dark:bg-gray-700">
      <div className="h-24" />
      <Navbar />
      <main className="flex-grow md:mx-auto mx-3 xl:wp lg:w-wpl w-wps my-12">
        {children}
        <Analytics />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
