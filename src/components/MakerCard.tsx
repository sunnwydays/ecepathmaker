import { FC } from 'react';
import { DraggableCardProps } from '../types/CourseTypes';
import Draggable from '../components/Draggable';
import { getTextColor } from '../utils/getTextColor';
import { getOtherLabels, getPreqLabels, getStreamLabels } from '../utils/getLabels';

interface MakerCardProps extends DraggableCardProps {
    valid: boolean;
};

const MakerCard:FC<MakerCardProps> = (props) => {
    const textColor = getTextColor(props.color);
    
    return (
        <Draggable id={props.id}>{(isExpanded) =>
            <article
                className={`
                    text-xs
                    ${isExpanded ? 'size-[10rem] border-2 border-black border-opacity-20' : 'size-32'}
                    hover:transition-[width,height]
                    flex flex-col items-center justify-center 
                    rounded-md
                    relative
                    ${props.valid ? textColor : 'text-black text-opacity-40'}
                    ${!props.color && 'bg-neutral2'}
                `}
                style={{backgroundColor: 
                    props.valid ? 
                        props.color ? `#${props.color}` : undefined : 
                        'rgba(255, 111, 97, 0.7)',
                }}
            >
                <h1 className="text-xl font-medium">{props.code}</h1> 
                <p className={`${isExpanded ? "w-36 line-clamp-3" : "w-28 line-clamp-2"} text-center text-sm`}>{props.name}</p>
                { getStreamLabels(props) && <p>Stream: {getStreamLabels(props)}</p> }
                { getOtherLabels(props) && <p>{getOtherLabels(props)}</p> }
                {isExpanded && (
                    <>
                        { props.preq && props.preq.length > 0 && <p>Preq: {getPreqLabels(props)}</p> }
                        {(props.onlyF || props.onlyS) && (
                            <p>{props.onlyF ? 'Fall' : 'Winter'} only</p>
                        )}
                    </>
                )}
                {props.onlyF && <span className="absolute top-0 right-0 text-xs bg-white bg-opacity-20 rounded-full p-1">🍂</span>}
                {props.onlyS && <span className="absolute top-0 right-0 text-xs bg-white bg-opacity-20 rounded-full p-1">❄️</span>}
            </article>
        }</Draggable>
    );
};

export default MakerCard;