import { FC } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import { DraggableCardProps } from "../../types/types";
import {
  getTextColor,
  getBackgroundColor,
  getOtherLabels,
  getPreqLabels,
  getStreamLabels,
} from "../../utils/utilImports";

const CourseCard: FC<DraggableCardProps> = (props) => {
  const sortable = useSortable({ id: props.id, index: props.index });
  const style = {
    backgroundColor: getBackgroundColor(props.color, props.streams?.[0], props.isSciMath, props.isCS, props.isHSS),
  };

  if (sortable.isDragging) {
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
        ref={sortable.ref}
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
      ref={sortable.ref}
      style={style}
    >
      <h1 className="text-lg font-medium">
        <span data-testid="course-code">{props.code}</span>
        <span>: {props.name}</span>
      </h1>
      {getStreamLabels(props) && <p>Streams: {getStreamLabels(props)}</p>}
      {getOtherLabels(props) && <p>Other labels: {getOtherLabels(props)}</p>}
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
