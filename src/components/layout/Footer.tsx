import { FC } from 'react';
import { doc, deleteDoc } from "firebase/firestore";
import { db, auth } from '../../firebase/firebase';

const Footer:FC = () => {
    const scrollToTop = () => {
        if (window.location.pathname !== '/') {
            window.location.href = '/';
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const resetChanges = async () => {
        if (window.confirm(`Are you sure you want to reset all saved data in local storage and cloud (if signed in)? 
This will remove your custom courses, undo your edits, and clear your layout. This will also allow updates to take effect.`)) {
            const user = auth.currentUser;

            if (user) {
            try {
                // Nuke the cloud record entirely
                await nukeCloudData(user.uid); 
            } catch (error) {
                console.error("Firebase nuke failed:", error);
            }
            }

            const savedTheme = localStorage.getItem('theme');
            localStorage.clear();

            if (savedTheme) localStorage.setItem('theme', savedTheme);
            window.location.reload();
            
        }
    }

    const nukeCloudData = async (uid: string) => {
        const userDocRef = doc(db, "users", uid);
        await deleteDoc(userDocRef);
    };


    return (
        <footer className="bg-green3 dark:bg-green4 md:w-full w-navFoot">
            <div className={`
                mx-auto 
                px-4 py-12 
                xl:wp lg:w-wpl w-wps 
                text-neutral2 
                grid sm:grid-cols-2 grid-cols-1 
                gap-4
            `}>
                <div>
                    <h3 className="font-medium mb-4 text-neutral1">
                        ECE Pathmaker
                    </h3>
                    <p className="leading-7">
                        <button onClick={scrollToTop} className="text-left">
                            Unofficial companion tool to UofT ECE's Magellan
                        </button>
                    </p>
                    <p className="leading-7">
                        Complete your courses in Magellan by January 30
                    </p>
                    <p className="leading-7">
                        <a href="https://github.com/sunnwydays">
                            Site created by Sunny
                        </a>
                    </p>
                </div>
                <div>
                    <h3 className="font-medium mb-4 text-neutral1">
                        Extra
                    </h3>
                    <p className="leading-7">
                        <a href="https://github.com/sunnwydays/ecepathmaker">
                            View the GitHub
                        </a>
                    </p>
                    <p className="leading-7">
                        <a href="https://forms.gle/yBPDvHKAPVmhyz1M8">
                            Provide feedback
                        </a>
                    </p>
                    <p className="leading-7">
                        <button onClick={resetChanges}>
                            Reset all changes
                        </button>
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer;