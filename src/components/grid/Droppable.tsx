import { useDroppable } from "@dnd-kit/core";
import { FC, ReactNode } from "react";

interface DroppableProps {
  children: ReactNode;
  id: string;
  valid: boolean;
}

const Droppable: FC<DroppableProps> = (props) => {
  const { isOver, setNodeRef } = useDroppable({
    id: props.id,
  });
  const styleClasses = `
        absolute
        transition-all
        flex items-center justify-center
        text-neutral3
        rounded-md
        ${
          props.valid
            ? isOver
              ? "bg-green1 bg-opacity-70 size-36"
              : "bg-neutral1 dark:bg-gray-600 size-32"
            : "bg-comp3 bg-opacity-55 size-32 text-opacity-0"
        }
    `;

  return (
    <div className="relative size-32 flex items-center justify-center">
      <div ref={setNodeRef} className={styleClasses}>
        {props.children}
      </div>
    </div>
  );
};
// Nested divs prevent the droppables from blocking the draggable when dragging

export default Droppable;
