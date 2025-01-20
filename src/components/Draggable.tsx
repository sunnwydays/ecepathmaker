import {useDraggable} from '@dnd-kit/core';
import { FC, ReactNode, useEffect, useState, useCallback } from 'react';

interface DraggableProps {
    children: (isExpanded: boolean) => ReactNode;
    id: string;
};

const Draggable:FC<DraggableProps> = (props) => {
    const [isExpanded, setIsExpanded] = useState(false);
  
  const {attributes, listeners, setNodeRef, transform,isDragging} = useDraggable({
    id: props.id,
  });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    touchAction: "none",
  } : {
    touchAction: "none",
  };

  const styleClasses = `
    ${isDragging ? 'size-32 z-20 rounded-md shadow-md' : isExpanded ? 'size-[10rem] z-30' : 'size-32 z-20'}
    flex items-center justify-center 
    text-black
  `;

  useEffect(() => {
    if (isDragging) {
      setIsExpanded(false);
    }
  }, [isDragging]);

  const setRefs = useCallback(
    (node: HTMLButtonElement | null) => {
        setNodeRef(node);
    }, [setNodeRef]
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
        const element = document.querySelector(`[data-draggable-id="${props.id}"]`);
        if (element && !element.contains(e.target as Node)) {
            setIsExpanded(false);
        }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [props.id]);

  return (
    <button 
      ref={setRefs}
      style={style} 
      className={styleClasses} 
      {...listeners} 
      {...attributes} 
      data-draggable-id={props.id}
      onClick={() => {setIsExpanded(!isExpanded)}}
    >
        {props.children(isExpanded)}
    </button>
  );
}

export default Draggable;