import { FC, ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-24 md:block hidden" />
      <Navbar />
      <main className="flex-grow mx-auto xl:wp lg:w-wpl w-wps my-12">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;