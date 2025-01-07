import { FC } from 'react';
import { CourseCardProps } from '../types/CourseTypes';


const CourseCard:FC<CourseCardProps> = (props) => {
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

    return (
        <article className={`bg-${props.color ? "#"+props.color : "neutral1"} flex flex-col`}>
            <h1>
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