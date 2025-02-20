import { FC } from "react";
import { DraggableCardProps } from "../../types/CourseTypes";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getTextColor } from "../../utils/getTextColor";
import {
  getOtherLabels,
  getPreqLabels,
  getStreamLabels,
} from "../../utils/getLabels";

const CourseCard: FC<DraggableCardProps> = (props) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.id,
  });
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    backgroundColor: props.color ? `#${props.color}` : undefined,
  };

  if (isDragging) {
    return (
      <div
        className="
                    bg-comp1
                    h-[11rem]
                    opacity-25
                    rounded-md
                    ring-2 ring-comp2
                "
        style={style}
        ref={setNodeRef}
      />
    );
  }

  return (
    <article
      data-testid="card-container"
      className={`
                flex flex-col justify-center 
                p-8
                h-[11rem]
                rounded-md
                ${!props.color && "bg-neutral2"}
                ${getTextColor(props.color)}
            `}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <h1 className="text-lg font-medium">
        <span data-testid="course-code">{props.code}</span>
        <span>: {props.name}</span>
      </h1>
      {getStreamLabels(props) && <p>Streams: {getStreamLabels(props)}</p>}
      {getOtherLabels(props) && <p>Other labels: {getOtherLabels(props)}</p>}
      {props.preq && props.preq.length > 0 && (
        <p>Prerequisites: {getPreqLabels(props)}</p>
      )}
      {(props.onlyF || props.onlyS) && (
        <p>{props.onlyF ? "Fall (F)" : "Winter (S)"} term only</p>
      )}
    </article>
  );
};

export default CourseCard;
