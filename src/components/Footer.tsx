import { FC } from 'react';

const Footer:FC = () => {
    const scrollToTop = () => {
        if (window.location.pathname !== '/') {
            window.location.href = '/';
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <footer className="bg-green3 md:w-full w-navFoot">
            <div className="mx-auto xl:wp lg:w-wpl w-wps py-12 text-neutral2 px-4 grid sm:grid-cols-2 grid-cols-1 gap-4">
                <div>
                    <h3 className="font-medium mb-4 text-neutral1">ECE Pathmaker</h3>
                    <p className="leading-7"><button onClick={scrollToTop} className="text-left" >Alternative to UofT ECE's Magellan</button></p>
                    <p className="leading-7">Complete your courses in Magellan by January 30</p>
                    <p className="leading-7"><a href="https://github.com/sunnwydays">Site created by Sunny</a></p>
                </div>
                <div>
                    <h3 className="font-medium mb-4 text-neutral1">Extra</h3>
                    <p className="leading-7"><a href="https://github.com/sunnwydays/ecepathmaker">View the GitHub</a></p>
                    <p className="leading-7"><a href="https://forms.gle/yBPDvHKAPVmhyz1M8">Provide feedback</a></p>
                </div>
            </div>
        </footer>
    )
}

export default Footer;