import { useDraggable } from '@dnd-kit/react';
import { FC, ReactNode, useEffect, useState } from 'react';

interface DraggableProps {
    children: (isExpanded: boolean) => ReactNode;
    id: string;
};

const Draggable:FC<DraggableProps> = (props) => {
    const [isExpanded, setIsExpanded] = useState(false);
  
  const draggable = useDraggable({ id: props.id, });
  const { isDragging } = draggable;
  const style = { touchAction: isDragging ? "none" : "auto"  };

  const styleClasses = `
    ${
      isDragging
        ? "size-32 z-20 rounded-md shadow-lg"
        : isExpanded
          ? "z-30"
          : "z-20"
    }
    flex items-center justify-center 
    text-black
  `;

  useEffect(() => {
    if (isDragging) {
      setIsExpanded(false);
    }
  }, [isDragging]);

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
      ref={draggable.ref}
      style={style} 
      className={styleClasses} 
 
      data-draggable-id={props.id}
      onClick={() => {setIsExpanded(!isExpanded)}}
    >
        {props.children(isExpanded)}
    </button>
  );
}

export default Draggable;