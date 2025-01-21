import { FC, ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-24" />
      <Navbar />
      <main className="flex-grow md:mx-auto mx-3 xl:wp lg:w-wpl w-wps my-12">
        {children}
        <Analytics />
        <SpeedInsights />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;