import { Menu, X } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FC, useState, useEffect, useRef } from 'react';
import { logo } from '../../utils/assetImports';
import ThemeToggle from "../ThemeToggle";
import SignIn from "../SignIn";
import { iconButton, navPill, navPillActive, navPillIdle } from "../../styles/ui";

const links = [
    { to: "/", label: "Maker", end: true },
    { to: "/courses", label: "Course Explorer", end: false },
    { to: "/plan", label: "AI Planner", end: false },
    { to: "/faq", label: "FAQs", end: false },
];

const Navbar: FC<{ wide?: boolean }> = ({ wide = false }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { pathname } = useLocation();

    // Close the drawer on outside tap, Escape, or a page change
    useEffect(() => {
        const handlePointerDown = (event: PointerEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsMenuOpen(false);
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <nav className={`
            fixed z-40 top-0 w-full
            transition-[height] duration-200 ease-out ${isScrolled ? 'h-14' : 'h-24'}
            dark:text-white
        `}>
            {/* The blur lives on its own layer: backdrop-filter on the nav itself
                would make it the containing block of the fixed drawer below */}
            <div
                aria-hidden
                className="
                    absolute inset-0 -z-10 backdrop-blur transition-colors duration-150
                    border-b border-neutral2 bg-white/80
                    dark:border-gray-600 dark:bg-gray-800/80
                "
            />
            <div className={`
                mx-auto ${wide ? 'xl:w-[90%] lg:w-[92%]' : 'lg:w-wpl'} w-wps
                flex justify-between items-center py-2
            `}>
                <Link
                    to="/"
                    className={`${isScrolled ? 'w-24' : 'w-56'} transition-[width] duration-200 ease-out`}
                >
                    <img src={logo} alt="ECE Pathmaker logo" />
                </Link>
                <div className="z-30 flex items-center" ref={menuRef}>
                    <div
                        aria-hidden
                        onClick={() => setIsMenuOpen(false)}
                        className={`
                            md:hidden fixed inset-0 bg-black/30
                            transition-opacity duration-200 ease-out
                            ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                        `}
                    />
                    <ul className={`
                        md:static fixed
                        top-0 ${isMenuOpen ? 'right-0' : '-right-full max-md:invisible'}
                        md:h-auto h-screen
                        md:bg-transparent bg-white
                        dark:md:bg-transparent dark:bg-gray-800
                        md:w-auto w-64
                        md:border-0 border-l border-neutral2 dark:border-gray-600
                        flex flex-col md:flex-row
                        items-center justify-center
                        md:transition-none max-md:transition-[right,visibility] duration-200 ease-out
                        md:gap-2 gap-4
                        text-base
                        md:py-0 py-12
                        md:px-0 px-5
                    `}>
                        {links.map(({ to, label, end }) => (
                            <li key={to} className="max-md:w-full max-md:text-center">
                                <NavLink
                                    to={to}
                                    end={end}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={({ isActive }) => `
                                        block ${navPill}
                                        ${isActive ? navPillActive : navPillIdle}
                                    `}
                                >
                                    {label}
                                </NavLink>
                            </li>
                        ))}
                        <li>
                            <SignIn />
                        </li>
                        <li>
                            <ThemeToggle />
                        </li>
                    </ul>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`z-50 md:hidden ${iconButton}`}
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={isMenuOpen}
                    >
                        {!isMenuOpen ? <Menu className="size-6" /> : <X className="size-6" />}
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;
