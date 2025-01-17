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
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <h3 className="text-lg font-semibold mb-1">Basic Requirements</h3>
                    <p>CS (4+): {conditions.hasCS ? '✅' : '❌'} | HSS (2+): {conditions.hasHSS ? '✅' : '❌'}</p>
                    <p>Economics: {conditions.hasEconomics ? '✅' : '❌'}</p>
                    <p>Capstone: {conditions.hasCapstone ? '✅' : '❌'}</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-1">Depth and Breadth</h3>
                    <p>Depth: {conditions.hasDepth ? '✅' : '❌'}
                        {conditions.depthStreams?.length ? 
                        `  |  Stream ${conditions.depthStreams?.join(', ')}` : null }</p>
                    <p>Breadth: {conditions.hasBreadth ? '✅' : '❌'}
                        {conditions.breadthStreams?.length ? 
                        `  |  Stream ${conditions.breadthStreams?.join(', ')}` : null }</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-1">Courses per stream</h3>
                    {Object.values(conditions.streamCounts).some(count => count > 0) ? (
                        <div className="space-y-1">
                            {Object.entries(conditions.streamCounts).map(([stream, count]) => (
                                count > 0 && (
                                    <p key={stream}>
                                        Stream {stream}: {count}
                                    </p>
                                )
                            ))}
                        </div>
                    ) : (
                        <p className="text-neutral3 italic">No courses in any stream yet</p>
                    )}
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-1">Courses missing prereqs</h3>
                </div>
            </div>
            <div className='mt-8 p-8 flex flex-col items-center justify-center w-full bg-neutral1 rounded shadow'>
                { graduation ? <h2 className="text-2xl font-semibold text-green3">🎓 You graduate</h2>
                : <h2 className="text-2xl font-semibold text-comp3">😅 You are not graduating with this one</h2> }
                <div>
                    <p className='mt-4 text-neutral-500'>Also check other requirements: PEY / 600h technical xp, AUs, Courses overlapping streams, Kernels, Free & Technical electives, Sci/Math (area 7), Exclusions, Minors/Certs, 1.5 300/400 ArtSci credit limit (Magellan tells you most of these)</p>
                </div>
            </div>
        </div>
    )
}

export default WillYouGraduate;