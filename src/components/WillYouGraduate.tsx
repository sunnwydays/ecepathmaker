import { FC } from 'react';
import { StreamRequirements } from "../types/CourseTypes";
import { BarChart } from '@mui/x-charts/BarChart';
import { ClickableTooltip } from './ClickableTooltip';
import { TooltipProvider } from './ui/tooltip';

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

    const graphColors = [
        '#ffcc99', 
        '#99ccff',
        '#b3e6b3',
        '#e6b3ff',
        '#ffb3b3',
        '#ffd699'
    ];

    const streamData = Object.entries(conditions.streamCounts)
        .filter(([, count]) => count > 0);

    const streams = streamData.map(([stream]) => Number(stream));
    const counts = streamData.map(([, count]) => count);
    const colors = streams.map(stream => graphColors[stream - 1]);
    const otherChartSettings = {
        width: 220,
        height: 170,
        margin: { top: 10, bottom: 40, left: 28, right: 0 },
        borderRadius: 5,
    };

    return (
        <div className="mt-6">
            <div className="grid grid-cols-3 gap-3">
                <div className='mb-4'>
                    <h3 className="text-lg font-semibold mb-1">Basics</h3>
                    <ul className="space-y-1">
                        <li className='flex items-center'>
                            CS<ClickableTooltip>At least 4 complementary study electives (including HSS)</ClickableTooltip>
                            : {conditions.hasCS ? '✅' : '❌'}
                        </li>
                        <li className='flex items-center'>
                            HSS<ClickableTooltip>At least 2 humanities/social science electives</ClickableTooltip>
                            : {conditions.hasHSS ? '✅' : '❌'}
                        </li>
                        <li className='flex items-center'>
                            Economics<ClickableTooltip>ECE472 required</ClickableTooltip>
                            : {conditions.hasEconomics ? '✅' : '❌'}
                        </li>
                        <li className='flex items-center'>
                            Capstone<ClickableTooltip>Both halves of the fourth-year capstone required</ClickableTooltip>
                            : {conditions.hasCapstone ? '✅' : '❌'}
                        </li>
                        <li className='flex items-center'>
                            Sci/Math<ClickableTooltip>At least 1 math/science (Area 7) course</ClickableTooltip>
                            : { conditions.hasSciMath ? '✅' : '❌' }
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-1">Depth and Breadth</h3>
                    <ul className='space-y-1'>
                        <li className='flex items-center'>
                            Depth<ClickableTooltip>Has stream kernel + 2 other stream courses</ClickableTooltip>
                            : {conditions.hasDepth ? '✅' : '❌'}
                        </li>
                        {conditions.depthStreams?.length > 0 &&
                            <li>Depth streams: {conditions.depthStreams?.join(', ')}</li>}
                        <li className='flex items-center'>
                            Breadth<ClickableTooltip>Has stream kernel</ClickableTooltip>
                            : {conditions.hasBreadth ? '✅' : '❌'}
                        </li>
                        {conditions.breadthStreams?.length > 0 &&
                            <li>Breadth streams: {conditions.breadthStreams?.join(', ')}</li>}
                        <li>CE/EE: {conditions.ceOrEE ? <b className='font-semibold'>
                            {conditions.ceOrEE === 'CE' ? 
                                'CE 🖥' : 
                                conditions.ceOrEE === 'ECE' ? 
                                    'CE or EE ⚡' : 
                                    'EE 🔌'
                            }
                        </b> : "none"}</li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-1">Courses per stream</h3>
                    {streams.length > 0 ? (
                        <BarChart
                            xAxis={[{
                                id: 'streamCategories',
                                data: streams,
                                scaleType: 'band',
                                colorMap: {
                                    type: 'ordinal',
                                    colors: colors,
                                },
                                label: 'Stream',
                            }]}
                            series={[{
                                data: counts
                            },]}
                            {...otherChartSettings}
                        />
                    ) : (
                        <p className="text-neutral3 italic select-none">No courses in any stream yet</p>
                    )}
                </div>
            </div>
            <div className='mt-4 p-8 flex flex-col items-center justify-center w-full bg-neutral1 rounded shadow'>
                { graduation ? <h2 className="text-2xl font-semibold text-green3">🎓 You graduate</h2>
                : <h2 className="text-2xl font-semibold text-comp3">😅 You are not graduating with this one</h2> }
                <div className='text-neutral-500 mt-4 text-sm'>
                    <p>Check on your own: Free & technical elective, PEY / 600h technical XP, CEAB, No exclusion violation, Within 1.5 credit ArtSci -300/-400 limit</p>
                    <p>Known concerns: <b className="font-medium">A course in multiple streams will in all of those streams which may affect your depth and breadth calculation</b>, dragging a course with prereq then removing prereq, no minor/cert check.</p>
                </div>
            </div>
        </div>
    )
}

export default WillYouGraduate;