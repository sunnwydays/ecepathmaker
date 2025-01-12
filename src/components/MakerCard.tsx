import { FC } from 'react';
import { DraggableCardProps } from '../types/CourseTypes';
import Draggable from '../components/Draggable';

const MakerCard:FC<DraggableCardProps> = (props) => {
    const getStreamLabels = () => {
        if (!props.streams?.length) return 'None';
        return props.streams
            .map(stream => stream.toString())
            .sort((a, b) => a.localeCompare(b))
            .join(', ');
    };

    const getOtherLabels = () => {
        const labels = [];
        if (props.isCS) labels.push('CS');
        if (props.isHSS) labels.push('HSS');
        if (props.isArtSci) labels.push('ArtSci');
        return labels.length ? labels.join(', ') : null;
    };

    return (
        <Draggable id={props.id}>
            <article
                className={`
                    text-sm size-32 
                    flex flex-col items-center justify-center 
                    text-black
                    rounded-md
                    ${!props.color && 'bg-neutral2'}
                `}
                style={{backgroundColor: props.color ? `#${props.color}` : undefined}}
            >
                <h1 className="text-xl font-medium">{props.code}</h1> 
                <p className="w-28 text-center line-clamp-2">{props.name}</p>
                { getStreamLabels() && <p>Stream: {getStreamLabels()}</p> }
                { getOtherLabels() && <p>{getOtherLabels()}</p> }
            </article>
        </Draggable>
    );
};

export default MakerCard;