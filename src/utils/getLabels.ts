import { DraggableCardProps } from "../types/types";
import { getMembership, hasFlag } from "../requirements/evaluate";
import { Curriculum } from "../requirements/types";

export const getStreamLabels = (
  props: DraggableCardProps,
  curriculum: Curriculum
) => {
  const { groups, kernel } = getMembership(curriculum, props.code, props);
  if (!groups.length) return null;
  if (kernel) return groups[0] + " (k)";
  return [...groups].sort((a, b) => a.localeCompare(b)).join(", ");
};

export const getOtherLabels = (
  props: DraggableCardProps,
  curriculum: Curriculum
) => {
  const labels = [];
  if (props.isCS) labels.push("CS");
  if (props.isHSS) labels.push("HSS");
  if (hasFlag(curriculum, "isSciMath", props.code, props)) labels.push("Sci/Math");
  if (props.isArtSci) labels.push("ArtSci");
  return labels.length ? labels.join(", ") : null;
};

export const getPreqLabels = (preq: (string | string[])[]) => {
  if (!preq?.length) return null;

  return preq
    .map((prereq) => {
      if (Array.isArray(prereq)) {
        return prereq.join(" or ");
      }
      return prereq;
    })
    .join(", ");
};
