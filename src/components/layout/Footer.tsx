import { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, deleteDoc } from "firebase/firestore";
import { db, auth } from '../../firebase/firebase';
import { eyebrow } from '../../styles/ui';
import { useArmed } from '../../utils/useArmed';

const footerLink = "hover:text-green3 hover:underline dark:hover:text-green1";

const Footer: FC<{ wide?: boolean }> = ({ wide = false }) => {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const scrollToTop = () => {
        if (pathname !== '/') {
            navigate('/');
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Reset asks twice: the first click turns the button into "Sure?"
    const { armed, arm, disarm } = useArmed();

    const resetChanges = async () => {
        if (!armed) {
            arm();
            return;
        }
        disarm();
        const user = auth.currentUser;

        if (user) {
        try {
            // Nuke the cloud record entirely
            await nukeCloudData(user.uid); 
        } catch (error) {
            console.error("Firebase nuke failed:", error);
        }
        }

        // Theme, curriculum and the sixth column are settings, not layout data, so keep them
        const savedTheme = localStorage.getItem('theme');
        const savedCurriculum = localStorage.getItem('curriculum');
        const savedShowSixth = localStorage.getItem('showSixth');
        localStorage.clear();

        if (savedTheme) localStorage.setItem('theme', savedTheme);
        if (savedCurriculum) localStorage.setItem('curriculum', savedCurriculum);
        if (savedShowSixth) localStorage.setItem('showSixth', savedShowSixth);
        window.location.reload();
    }

    const nukeCloudData = async (uid: string) => {
        const userDocRef = doc(db, "users", uid);
        await deleteDoc(userDocRef);
    };


    return (
        <footer className="
            border-t border-neutral2 bg-neutral1 md:w-full w-navFoot
            dark:border-gray-600 dark:bg-gray-800
        ">
            <div className={`
                mx-auto 
                px-4 py-12 
                ${wide ? 'xl:w-[90%] lg:w-[92%]' : 'lg:w-wpl'} w-wps 
                text-gray-600 dark:text-gray-300
                grid sm:grid-cols-2 grid-cols-1 
                gap-4
            `}>
                <div>
                    <h3 className={`${eyebrow} mb-4`}>
                        ECE Pathmaker
                    </h3>
                    <p className="leading-7">
                        <button onClick={scrollToTop} className={`text-left ${footerLink}`}>
                            Unofficial companion tool to UofT ECE's Magellan
                        </button>
                    </p>
                    <p className="leading-7">
                        Complete your courses in Magellan by January 30
                    </p>
                    <p className="leading-7">
                        <a href="https://github.com/sunnwydays" className={footerLink}>
                            Site created by Sunny
                        </a>
                    </p>
                </div>
                <div>
                    <h3 className={`${eyebrow} mb-4`}>
                        Extra
                    </h3>
                    <p className="leading-7">
                        <a href="https://github.com/sunnwydays/ecepathmaker" className={footerLink}>
                            View the GitHub
                        </a>
                    </p>
                    <p className="leading-7">
                        <a href="https://forms.gle/yBPDvHKAPVmhyz1M8" className={footerLink}>
                            Provide feedback
                        </a>
                    </p>
                    <p className="leading-7">
                        <button
                            onClick={resetChanges}
                            onBlur={disarm}
                            className={armed ? "font-medium text-comp3 dark:text-comp1" : footerLink}
                        >
                            {armed ? "Sure?" : "Reset all changes"}
                        </button>
                        {armed && (
                            <span className="ml-2 text-xs">
                                Wipes your layout, custom courses and edits, here and in the cloud
                            </span>
                        )}
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer;