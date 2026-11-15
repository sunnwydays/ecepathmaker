import { useDroppable } from "@dnd-kit/core";
import { FC, ReactNode } from "react";
import { cellSize } from "./cellSize";

interface DroppableProps {
  children: ReactNode;
  id: string;
  valid: boolean;
  compact?: boolean; // smaller cell while the sixth column is visible
  sixth?: boolean; // a cell of the sixth column, tinted differently
}

const Droppable: FC<DroppableProps> = (props) => {
  const { isOver, setNodeRef } = useDroppable({
    id: props.id,
  });
  const { size, hover } = cellSize(props.compact);
  const styleClasses = `
        absolute
        transition-[background-color,width,height]
        flex items-center justify-center
        text-neutral3
        rounded-md
        ${
          props.valid
            ? isOver
              ? `bg-green1 bg-opacity-70 ${hover}`
              : `${
                  props.sixth
                    ? "bg-neutral2 dark:bg-gray-500"
                    : "bg-neutral1 dark:bg-gray-600"
                } ${size}`
            : `bg-comp3 bg-opacity-55 ${size} text-opacity-0`
        }
    `;

  return (
    <div className={`relative ${size} flex items-center justify-center`}>
      <div ref={setNodeRef} className={styleClasses}>
        {props.children}
      </div>
    </div>
  );
};
// Nested divs prevent the droppables from blocking the draggable when dragging

export default Droppable;
