import { FC } from 'react';
import { CourseCardProps } from '../types/CourseTypes';
import Draggable from '../components/Draggable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MakerCardProps extends CourseCardProps {
    id: string;
}

const MakerCard:FC<MakerCardProps> = (props) => {
    const {
        setNodeRef, 
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({ 
        id: props.id,
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    }

    if (isDragging) {
        <div ref={setNodeRef} style={style}>
            ueoa
        </div>
    }

    const getStreamLabels = () => {
        const streams = [];
        if (props.stream1) streams.push("1");
        if (props.stream2) streams.push("2");
        if (props.stream3) streams.push("3");
        if (props.stream4) streams.push("4");
        if (props.stream5) streams.push("5");
        if (props.stream6) streams.push("6");
        return streams.length ? streams.join(', ') : null;
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
                    ${props.color ? `bg-[#${props.color}]` : 'bg-neutral2'}
                    text-sm size-32 
                    flex flex-col items-center justify-center 
                    text-black
                `}
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
            >
                <h1 className="text-xl font-medium">{props.code}</h1> 
                <p className="w-28 text-center">{props.name}</p>
                { getStreamLabels() && <p>Stream: {getStreamLabels()}</p> }
                { getOtherLabels() && <p>{getOtherLabels()}</p> }
            </article>
        </Draggable>
    );
};

export default MakerCard;