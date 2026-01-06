import { DraggableCardProps } from "../types/types";

export const getStreamLabels = (props: DraggableCardProps) => {
  if (!props.streams?.length) return null;
  if (props.kernel) return props.streams[0] + " (k)";
  return props.streams
    .map((stream) => stream.toString())
    .sort((a, b) => a.localeCompare(b))
    .join(", ");
};

export const getOtherLabels = (props: DraggableCardProps) => {
  const labels = [];
  if (props.isCS) labels.push("CS");
  if (props.isHSS) labels.push("HSS");
  if (props.isSciMath) labels.push("Sci/Math");
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
