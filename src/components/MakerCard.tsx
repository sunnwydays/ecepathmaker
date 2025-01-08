import { FC } from 'react';
import { CourseCardProps } from '../types/CourseTypes';
import Draggable from '../components/Draggable';

interface MakerCardProps extends CourseCardProps {
    id: string;
}

const MakerCard:FC<MakerCardProps> = (props) => {
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
            <article className={`bg-${props.color ? "#"+props.color : "neutral1"} text-sm size-32 flex flex-col items-center justify-center text-black`}>
                <h1 className="text-xl font-medium">{props.code}</h1> 
                <p className="w-28 text-center">{props.name}</p>
                { getStreamLabels() && <p>Stream: {getStreamLabels()}</p> }
                { getOtherLabels() && <p>{getOtherLabels()}</p> }
            </article>
        </Draggable>
    );
};

export default MakerCard;