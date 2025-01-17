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
        conditions.hasEconomics &&
        conditions.hasCapstone;

    return (
        <div className="mt-8">
            <div className="grid lg:grid-cols-4 grid-cols-2 gap-3">
                <div>
                    <h3 className="text-lg font-semibold mb-1">Depth and Breadth</h3>
                    <ul className='space-y-1'>
                        <li>Depth: {conditions.hasDepth ? '✅' : '❌'}</li>
                        <li>{conditions.depthStreams?.length ? 
                            `Depth streams: ${conditions.depthStreams?.join(', ')}` : null }</li>
                        <li>Breadth: {conditions.hasBreadth ? '✅' : '❌'}</li>
                        <li>{conditions.breadthStreams?.length ? 
                            `Breadth streams: ${conditions.breadthStreams?.join(', ')}` : null }</li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-1">Basic Requirements</h3>
                    <ul className="space-y-1">
                        <li>CS (4+): {conditions.hasCS ? '✅' : '❌'}</li>
                        <li>HSS (2+): {conditions.hasHSS ? '✅' : '❌'}</li>
                        <li>Economics: {conditions.hasEconomics ? '✅' : '❌'}</li>
                        <li>Capstone: {conditions.hasCapstone ? '✅' : '❌'}</li>
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
                <div>
                    <h3 className="text-lg font-semibold mb-1">Check on your own</h3>
                    <ul className="space-y-1">
                        <li>Kernels</li>
                        <li>Free & Technical electives</li>
                        <li>Sci/Math (area 7)</li>
                        <li>CE or EE</li>
                    </ul>
                </div>
            </div>
            <div className='mt-8 p-8 flex flex-col items-center justify-center w-full bg-neutral1 rounded shadow'>
                { graduation ? <h2 className="text-2xl font-semibold text-green3">🎓 You graduate</h2>
                : <h2 className="text-2xl font-semibold text-comp3">😅 You are not graduating with this one</h2> }
                <div className='text-neutral-500 mt-4 text-sm'>
                    <p>Check other requirements: PEY / 600h technical XP, CEAB, No exclusion violation, Within 1.5 credit ArtSci -300/-400 limit</p>
                    <p>Known concerns: Course counting as multiple streams, dragging a course with prereq then removing prereq, no minor/cert check.</p>
                </div>
            </div>
        </div>
    )
}

export default WillYouGraduate;