import {useDraggable} from '@dnd-kit/core';
import { FC, ReactNode, useEffect, useRef, useState, useCallback } from 'react';
import { cellSize } from './cellSize';

interface DraggableProps {
    children: (isExpanded: boolean) => ReactNode;
    id: string;
    compact?: boolean;
    overlay?: boolean; // the copy that follows the pointer while dragging
    landed?: boolean; // the user just dropped this card here
};

// One pair of document listeners for all expanded cards, present only while
// some card is expanded: Escape or a pointer press elsewhere closes them.
const expandedCards = new Map<string, { el: HTMLElement | null; close: () => void }>();

const handlePointerDown = (e: PointerEvent) => {
    expandedCards.forEach(({ el, close }) => {
        if (el && !el.contains(e.target as Node)) close();
    });
};
const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') expandedCards.forEach(({ close }) => close());
};

const registerExpanded = (id: string, el: HTMLElement | null, close: () => void) => {
    if (expandedCards.size === 0) {
        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
    }
    expandedCards.set(id, { el, close });
    return () => {
        expandedCards.delete(id);
        if (expandedCards.size === 0) {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        }
    };
};

const Draggable:FC<DraggableProps> = (props) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const elRef = useRef<HTMLButtonElement | null>(null);

  const {attributes, listeners, setNodeRef, transform,isDragging} = useDraggable({
    id: props.id,
  });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    touchAction: isDragging ? "none" : "auto",
  } : {
    touchAction: isDragging ? "none" : "auto",
  };

  // The overlay and the card it was lifted from share this id, so both report
  // isDragging; `overlay` tells them apart.
  const styleClasses = `
    ${
      isDragging
        ? `${cellSize(props.compact).size} z-20 rounded-md ${
            props.overlay
              ? "scale-105 shadow-lg cursor-grabbing"
              : "opacity-40"
          }`
        : `${isExpanded ? "z-30" : "z-20"} rounded-md cursor-grab
           transition-[transform,box-shadow] duration-150 ease-out
           hover:-translate-y-0.5 hover:shadow-md`
    }
    ${props.landed ? "animate-in fade-in zoom-in-95 duration-150" : ""}
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
        elRef.current = node;
        setNodeRef(node);
    }, [setNodeRef]
  );

  useEffect(() => {
    if (!isExpanded) return;
    return registerExpanded(props.id, elRef.current, () => setIsExpanded(false));
  }, [isExpanded, props.id]);

  return (
    <button
      ref={setRefs}
      style={style}
      className={styleClasses}
      {...listeners}
      {...attributes}
      aria-expanded={isExpanded}
      data-draggable-id={props.id}
      onClick={() => {setIsExpanded(!isExpanded)}}
    >
        {props.children(isExpanded)}
    </button>
  );
}

export default Draggable;
