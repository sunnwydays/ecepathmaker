import { FC } from 'react';
import { DraggableCardProps } from '../types/CourseTypes';
import Draggable from '../components/Draggable';

const MakerCard:FC<DraggableCardProps> = (props) => {
    const getStreamLabels = () => {
        if (!props.streams?.length) return null;
        if (props.kernel) return props.streams[0]+' (k)'
        return props.streams
            .map(stream => stream.toString())
            .sort((a, b) => a.localeCompare(b))
            .join(', ');
    };

    const getOtherLabels = () => {
        const labels = [];
        if (props.isCS) labels.push('CS');
        if (props.isHSS) labels.push('HSS');
        if (props.isSciMath) labels.push('Sci/Math');
        if (props.isArtSci) labels.push('ArtSci');
        return labels.length ? labels.join(', ') : null;
    };

    const getPreqLabels = () => {
        if (!props.preq || props.preq.length === 0) return null;
        
        return props.preq.map((prereq) => {
            if (Array.isArray(prereq)) {
                return prereq.join(' or ');
            }
            return prereq;
        }).join(', ');
    };

    return (
        <Draggable id={props.id}>{(isExpanded) =>
            <article
                className={`
                    text-xs
                    ${isExpanded ? 'size-[10rem] border-2 border-black border-opacity-20' : 'size-32'}
                    hover:transition-[width,height]
                    flex flex-col items-center justify-center 
                    text-black
                    rounded-md
                    ${!props.color && 'bg-neutral2'}
                `}
                style={{backgroundColor: props.color ? `#${props.color}` : undefined}}
            >
                <h1 className="text-xl font-medium">{props.code}</h1> 
                <p className={`${isExpanded ? "w-36 line-clamp-3" : "w-28 line-clamp-2"} text-center text-sm`}>{props.name}</p>
                {isExpanded ? (
                    <>
                        { getStreamLabels() && <p>Stream: {getStreamLabels()}</p> }
                        { getOtherLabels() && <p>{getOtherLabels()}</p> }
                        { props.preq && props.preq.length > 0 && <p>Preq: {getPreqLabels()}</p> }
                        {(props.onlyF || props.onlyS) && (
                            <p>{props.onlyF ? 'Fall' : 'Winter'} only</p>
                        )}
                    </>
                ) : (
                    <>
                        { getStreamLabels() && <p>Stream: {getStreamLabels()}</p> }
                        { getOtherLabels() && <p>{getOtherLabels()}</p> }
                    </>
                )}
            </article>
        }</Draggable>
    );
};

export default MakerCard;