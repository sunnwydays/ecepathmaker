import { IoIosMenu, IoIosClose } from "react-icons/io";
import { FC, useState, useEffect, useRef } from 'react';
import { logo } from '../../utils/assetImports';
import ThemeToggle from "../ThemeToggle";

const Navbar:FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
            transition-all ${isScrolled ? 'h-12' : 'h-24'} 
            bg-white bg-opacity-95 shadow border-b-1 
            dark:bg-gray-800 dark:bg-opacity-95 dark:text-white
        `}>
            <div className="
                mx-auto xl:wp lg:w-wpl w-wps 
                flex justify-between items-center py-2
            ">
                <a 
                    href="/" 
                    className={`${isScrolled ? 'w-24' : 'w-56' } transition-all`}
                >
                    <img src={logo} alt="ECE Pathmaker logo" />
                </a>
                <div className="z-30 flex items-center" ref={menuRef}>
                        <ul className={`
                            md:static fixed 
                            top-0 ${isMenuOpen ? 'right-0' : '-right-full'}
                            md:h-auto h-screen
                            md:bg-transparent bg-white 
                            dark:md:bg-transparent dark:bg-gray-800 
                            md:w-auto w-64
                            md:shadow-none shadow-md
                            flex flex-col md:flex-row
                            items-center justify-center
                            md:transition-none transition-all duration-500
                            md:gap-[3vw] gap-8
                            md:text-base font-medium text-xl
                            dark:text-white
                            ${isScrolled 
                                ? 'text-l md:font-normal' 
                                : 'md:font-medium md:text-xl'
                            }
                            md:py-0 py-12
                            md:px-0 px-5
                        `}>
                            <li>
                                <a 
                                    onClick={() => setIsMenuOpen(false)} 
                                    className="
                                        hover:text-green2 
                                        transition-all 
                                        mx-auto
                                    " 
                                    href="/"
                                >
                                    Maker
                                </a>
                            </li>
                            <li>
                                <a 
                                    onClick={() => setIsMenuOpen(false)} 
                                    className="
                                            hover:text-green2 
                                            transition-all 
                                            mx-auto
                                        " 
                                    href="/courses"
                                >
                                    Courses
                                </a>
                            </li>
                            <li>
                                <a 
                                    onClick={() => setIsMenuOpen(false)} 
                                    className="
                                        hover:text-green2 
                                        transition-all 
                                        mx-auto
                                    " 
                                    href="/faq"
                                >
                                    FAQs
                                </a>
                            </li>
                            <li>
                                <ThemeToggle />
                            </li>
                        </ul>
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="
                                z-50 md:hidden text-3xl cursor-pointer 
                                flex items-center
                            "
                        >
                            {!isMenuOpen ? <IoIosMenu /> : <IoIosClose />}
                        </button>
                    </div>
            </div>
        </nav>
    )
}

export default Navbar;