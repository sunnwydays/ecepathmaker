import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useState,
} from "react";
import { Analytics } from "@vercel/analytics/react";
import { Footer, Navbar } from "../../utils/componentImports";
import { savedLayout } from "../../types/types";

interface LayoutProps {
  children: ReactNode;
}

interface LayoutContextType {
  savedLayouts: savedLayout[];
  setSavedLayouts: React.Dispatch<React.SetStateAction<savedLayout[]>>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const LayoutContext = createContext<LayoutContextType | undefined>(
  undefined
);

const Layout: FC<LayoutProps> = ({ children }) => {
  const [savedLayouts, setSavedLayouts] = useState<savedLayout[]>(() => {
    const saved = localStorage.getItem("savedLayouts");
    return saved ? JSON.parse(saved) : [];
  });

  return (
    <LayoutContext.Provider value={{ savedLayouts, setSavedLayouts }}>
      <div className="min-h-screen flex flex-col w-max md:w-full dark:bg-gray-700">
        <div className="h-24" />
        <Navbar />
        <main className="flex-grow md:mx-auto mx-3 xl:wp lg:w-wpl w-wps my-12">
          {children}
          <Analytics />
        </main>
        <Footer />
      </div>
    </LayoutContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useLayoutContext() {
  const ctx = useContext(LayoutContext);
  if (!ctx)
    throw new Error("useLayoutContext must be used within LayoutProvider");
  return ctx;
}

export default Layout;
