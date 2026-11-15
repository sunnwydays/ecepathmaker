import { FC } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DraggableCardProps } from "../../types/types";
import { useCurriculum } from "../layout/Layout";
import { hasFlag } from "../../requirements/evaluate";
import {
  getTextColor,
  getBackgroundColor,
  getOtherLabels,
  getPreqLabels,
  getStreamLabels,
  getGroupColor,
} from "../../utils/utilImports";

const CourseCard: FC<DraggableCardProps> = (props) => {
  const curriculum = useCurriculum();
  const streamLabels = getStreamLabels(props, curriculum);
  const otherLabels = getOtherLabels(props, curriculum);
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
    backgroundColor: getBackgroundColor(
      props.color,
      getGroupColor(curriculum, props.code, props),
      hasFlag(curriculum, "isSciMath", props.code, props),
      props.isCS,
      props.isHSS
    ),
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
      {streamLabels && <p>Streams: {streamLabels}</p>}
      {otherLabels && <p>Other labels: {otherLabels}</p>}
      {props.preq && props.preq.length > 0 && (
        <p>Prerequisites: {getPreqLabels(props.preq)}</p>
      )}
      {props.coreq && props.coreq.length > 0 && (
        <p>Corequisites: {getPreqLabels(props.coreq)}</p>
      )}
      {(props.onlyF || props.onlyS) && (
        <p>{props.onlyF ? "Fall (F)" : "Winter (S)"} term only</p>
      )}
    </article>
  );
};

export default CourseCard;
