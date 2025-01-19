import {useDroppable} from '@dnd-kit/core';
import { FC, ReactNode } from 'react';

interface DroppableProps {
    children: ReactNode;
    id: string;
    valid: boolean;
};

const Droppable:FC<DroppableProps> = (props) => {
  const {isOver, setNodeRef} = useDroppable({
    id: props.id,
  });
  const styleClasses = `
        absolute
        transition-all
        flex items-center justify-center
        text-neutral3
        rounded-md
        ${props.valid ? 
          isOver ? 'bg-green1 bg-opacity-70 size-36' : 'bg-neutral1 size-32'
          : 'bg-comp2 bg-opacity-50 size-32 text-opacity-0'
        }
    `;
  
  return (
    <div className="relative size-32 flex items-center justify-center">
        <div ref={setNodeRef} className={styleClasses}>
          {props.children}
        </div>
    </div>
  );
}
// these bunch of divs allow the draggable to not be blocked by the droppable when dragging

export default Droppable;