import { IoIosMenu, IoIosClose } from "react-icons/io";
import { FC, useState, useEffect } from 'react';
import logo from '../assets/logo.png';

const Navbar:FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollPos = window.scrollY;
            setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
            setPrevScrollPos(currentScrollPos);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [prevScrollPos]);

    return (
        <nav className={`md:fixed top-0 left-0 right-0 bg-white bg-opacity-95 transition-transform duration-300 z-50 shadow border-b-2 border-neutral2 ${
            visible ? 'md:transform md:translate-y-0' : 'md:transform md:-translate-y-full'
        }`}>
            <div className="mx-auto xl:wp lg:w-wpl w-wps flex justify-between items-center py-2 h-24">
                <a href="/" className="w-56 z-50"><img src={logo} alt="ECE Pathmaker logo" /></a>
                <div className="z-30 flex items-center">
                    <div className={`z-40 bg-white md:static absolute md:w-auto md:min-h-fit left-0 w-full flex items-center px-5 md:py-0 py-12 font-medium ${isMenuOpen ? "top-24" : "top-[-100%]"} transition-all duration-500 ease-in-out`}>
                        <ul className="md:gap-[3vw] gap-8 items-center text-xl flex md:flex-row flex-col mx-auto justify-center">
                            <li>
                                <a className="hover:text-green2 transition-all mx-auto" href="/">Maker</a>
                            </li>
                            <li>
                                <a className="hover:text-green2 transition-all mx-auto" href="/courses">Courses</a>
                            </li>
                        </ul>
                    </div>
                    {!isMenuOpen ? 
                        <IoIosMenu onClick={()=>setIsMenuOpen(true)} className="z-50 md:hidden text-3xl cursor-pointer flex items-center" /> :
                        <IoIosClose onClick={()=>setIsMenuOpen(false)} className="z-50 md:hidden text-3xl cursor-pointer flex items-center" />
                    }
                </div>
            </div>
        </nav>
    )
}

export default Navbar;