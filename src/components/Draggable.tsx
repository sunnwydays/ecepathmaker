import {useDraggable} from '@dnd-kit/core';
import { FC, ReactNode } from 'react';

interface DraggableProps {
    children: ReactNode;
    id: string;
};

const Draggable:FC<DraggableProps> = (props) => {
  const {attributes, listeners, setNodeRef, transform,isDragging} = useDraggable({
    id: props.id,
  });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const styleClasses = `
    size-32 
    flex items-center justify-center 
    text-black
    ${isDragging ? 'z-30' : 'z-20'}
  `;

  return (
    <button ref={setNodeRef} style={style} className={styleClasses} {...listeners} {...attributes}>
        {props.children}
    </button>
  );
}

export default Draggable;