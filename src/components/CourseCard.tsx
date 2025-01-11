import { FC } from 'react';
import { DraggableCardProps } from '../types/CourseTypes';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const CourseCard:FC<DraggableCardProps> = (props) => {
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
        backgroundColor: props.color ? `#${props.color}` : undefined,
    }
    
    const getStreamLabels = () => {
        const streams = [];
        if (props.stream1) streams.push("1");
        if (props.stream2) streams.push("2");
        if (props.stream3) streams.push("3");
        if (props.stream4) streams.push("4");
        if (props.stream5) streams.push("5");
        if (props.stream6) streams.push("6");
        return streams.length ? streams.join(', ') : 'None';
    };
    
    const getOtherLabels = () => {
        const labels = [];
        if (props.isCS) labels.push('CS');
        if (props.isHSS) labels.push('HSS');
        if (props.isArtSci) labels.push('ArtSci');
        return labels.length ? labels.join(', ') : 'None';
    };
    
    if (isDragging) {
        return (
            <div 
                className="
                    bg-comp1
                    h-[11rem]
                    opacity-25
                    rounded-md
                    ring-2 ring-comp2
                "
                style={style}
                ref={setNodeRef}
            />
        );
    }
    
    return (
        <article 
            data-testid="card-container"
            className={`
                flex flex-col justify-center 
                text-black
                p-8
                h-[11rem]
                rounded-md
                ${!props.color && 'bg-neutral2'}
            `}
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
        >
            <h1 className='text-lg font-medium'>
                <span data-testid="course-code">{props.code}</span>
                <span>: {props.name}</span>
            </h1>
            <p>Streams: {getStreamLabels()}</p>
            { props.preq && <p>Prerequisites: {props.preq.join(', ')}</p> }
            <p>Other labels (CS, HSS, or ArtSci): {getOtherLabels()} </p>
            {(props.onlyF || props.onlyS) && (
                <p>{props.onlyF ? 'Fall (F)' : 'Winter (S)'} term only</p>
            )}
        </article>
    );
};

export default CourseCard;