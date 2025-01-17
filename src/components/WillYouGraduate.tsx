import { FC } from 'react';
import { StreamRequirements } from "../types/CourseTypes";

interface WillYouGraduateProps {
    conditions: StreamRequirements;
}

const WillYouGraduate: FC<WillYouGraduateProps> = ({ conditions }) => {
    const graduation = 
        conditions.hasBreadth &&
        conditions.hasDepth &&
        conditions.hasCS &&
        conditions.hasHSS &&
        conditions.hasSciMath &&
        conditions.hasEconomics &&
        conditions.hasCapstone;

    return (
        <div className="mt-8">
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <h3 className="text-lg font-semibold mb-1">Basics</h3>
                    <ul className="space-y-1">
                        <li>CS (4+): {conditions.hasCS ? '✅' : '❌'}</li>
                        <li>HSS (2+): {conditions.hasHSS ? '✅' : '❌'}</li>
                        <li>Economics: {conditions.hasEconomics ? '✅' : '❌'}</li>
                        <li>Capstone: {conditions.hasCapstone ? '✅' : '❌'}</li>
                        <li>Sci/Math: { conditions.hasSciMath ? '✅' : '❌' }</li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-1">Depth and Breadth</h3>
                    <ul className='space-y-1'>
                        <li>Depth: {conditions.hasDepth ? '✅' : '❌'}</li>
                        {conditions.depthStreams?.length > 0 &&
                            <li>Depth streams: {conditions.depthStreams?.join(', ')}</li>}
                        <li>Breadth: {conditions.hasBreadth ? '✅' : '❌'}</li>
                        {conditions.breadthStreams?.length > 0 &&
                            <li>Breadth streams: {conditions.breadthStreams?.join(', ')}</li>}
                        {conditions.ceOrEE && <li>You are <b className='font-semibold'>{conditions.ceOrEE === 'CE' ? 'CE 🖥' : 'EE 🔌'}</b></li>}
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-1">Courses per stream</h3>
                    {Object.values(conditions.streamCounts).some(count => count > 0) ? (
                        <ul className="space-y-1">
                            {Object.entries(conditions.streamCounts).map(([stream, count]) => (
                                count > 0 && (
                                    <li key={stream}>
                                        Stream {stream}: {count}
                                    </li>
                                )
                            ))}
                        </ul>
                    ) : (
                        <p className="text-neutral3 italic">No courses in any stream yet</p>
                    )}
                </div>
            </div>
            <div className='mt-8 p-8 flex flex-col items-center justify-center w-full bg-neutral1 rounded shadow'>
                { graduation ? <h2 className="text-2xl font-semibold text-green3">🎓 You graduate</h2>
                : <h2 className="text-2xl font-semibold text-comp3">😅 You are not graduating with this one</h2> }
                <div className='text-neutral-500 mt-4 text-sm'>
                    <p>Check other requirements: Free & technical elective, PEY / 600h technical XP, CEAB, No exclusion violation, Within 1.5 credit ArtSci -300/-400 limit</p>
                    <p>Known concerns: Course counting as multiple streams, dragging a course with prereq then removing prereq, no minor/cert check.</p>
                </div>
            </div>
        </div>
    )
}

export default WillYouGraduate;