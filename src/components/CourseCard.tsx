import { FC } from 'react';
import { CourseCardProps } from '../types/CourseTypes';


const CourseCard:FC<CourseCardProps> = (props) => {
    const getStreamLabels = () => {
        const streams = [];
        if (props.stream1 || props.stream1Kernel) streams.push(`1${props.stream1Kernel ? ' (kernel)' : ''}`);
        else if (props.stream2 || props.stream2Kernel) streams.push(`2${props.stream2Kernel ? ' (kernel)' : ''}`);
        else if (props.stream3 || props.stream3Kernel) streams.push(`3${props.stream3Kernel ? ' (kernel)' : ''}`);
        else if (props.stream4 || props.stream4Kernel) streams.push(`4${props.stream4Kernel ? ' (kernel)' : ''}`);
        else if (props.stream5 || props.stream5Kernel) streams.push(`5${props.stream5Kernel ? ' (kernel)' : ''}`);
        else if (props.stream6 || props.stream6Kernel) streams.push(`6${props.stream6Kernel ? ' (kernel)' : ''}`);
        return streams.length ? streams.join(', ') : 'None';
    };

    const getOtherLabels = () => {
        const labels = [];
        if (props.isCS) labels.push('CS');
        if (props.isHSS) labels.push('HSS');
        if (props.isArtSci) labels.push('ArtSci');
        return labels.length ? labels.join(', ') : 'None';
    };

    return (
        <article className={`bg-${props.color ? "#"+props.color : "neutral1"}`}>
            <h1>
                <span data-testid="course-code">{props.code}</span>
                <span>: {props.name}</span>
            </h1>
            <p>Streams: {getStreamLabels()}</p>
            <p>Prerequisites: {props.preq.join(', ')}</p>
            <p>Other labels (CS, HSS, or ArtSci): {getOtherLabels()} </p>
            {(props.onlyF || props.onlyS) && (
                <p>{props.onlyF ? 'Fall (F)' : 'Winter (S)'} term only</p>
            )}
        </article>
    );
};

export default CourseCard;