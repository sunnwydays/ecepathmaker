import { FC } from "react";
import { cellSize } from "./cellSize";
import { MakerCardProps } from "../../types/types";
import { Draggable } from "../../utils/componentImports";
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

const MakerCard: FC<MakerCardProps> = (props) => {
  const curriculum = useCurriculum();
  const textColor = getTextColor(props.color);
  const streamLabels = getStreamLabels(props, curriculum);
  const otherLabels = getOtherLabels(props, curriculum);

  const preqsToString = (preqs: (string | string[])[] | undefined): string => {
    if (!preqs) return "";

    return preqs
      .map((preq) => {
        if (Array.isArray(preq)) {
          return preq.join(" | ");
        }
        return preq;
      })
      .join(", ");
  };

  const handleEdit = () => {
    props.setCustomInfo({
      code: props.code,
      name: props.name,
      preq: props.preq,
      coreq: props.coreq,
      streams: props.streams,
      ...(props.group && { group: props.group }),
      ...(props.kernel && { kernel: props.kernel }),
      ...(props.isExtra && { isExtra: true }),
      color: props.color ?? "",
      isCS: props.isCS,
      isHSS: props.isHSS,
      isSciMath: props.isSciMath,
      isArtSci: props.isArtSci,
      onlyF: props.onlyF,
      onlyS: props.onlyS,
    });
    props.setPreqString(props.preq ? preqsToString(props.preq) : "");
    props.setCoreqString(props.coreq ? preqsToString(props.coreq) : "");

    document.getElementById("add-course")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <Draggable id={props.id} compact={props.compact}>
      {(isExpanded) => {
        // Compact only applies to the collapsed card; the expanded one is full size
        const compact = props.compact && !isExpanded;
        return (
        <article
          className={`
                    text-xs
                    ${
                      isExpanded
                        ? "size-[10rem] border-2 border-black border-opacity-20"
                        : cellSize(compact).size
                    }
                    transition-[width,height]
                    flex flex-col items-center justify-center 
                    rounded-md
                    relative
                    ${props.valid ? textColor : "text-black text-opacity-40"}
                `}
          style={{
            backgroundColor: props.valid
              ? getBackgroundColor(
                  props.color,
                  getGroupColor(curriculum, props.code, props),
                  hasFlag(curriculum, "isSciMath", props.code, props),
                  props.isCS,
                  props.isHSS
                )
              : "rgba(255, 111, 97, 0.7)",
          }}
        >
          <h1 className={`${compact ? "text-base" : "text-xl"} font-medium`}>
            {props.code}
          </h1>
          <p
            className={`${
              isExpanded
                ? "w-36 line-clamp-3 text-sm"
                : compact
                  ? "w-[5.5rem] line-clamp-2 text-xs leading-tight"
                  : "w-28 line-clamp-2 text-sm"
            } text-center`}
          >
            {props.name}
          </p>
          {streamLabels && (
            <p className={compact ? "text-[10px] leading-tight" : ""}>
              Stream: {streamLabels}
            </p>
          )}
          {otherLabels && (
            <p
              className={
                compact
                  ? "text-[10px] leading-tight w-[5.5rem] truncate text-center"
                  : ""
              }
            >
              {otherLabels}
            </p>
          )}
          {isExpanded && props.preq && props.preq.length > 0 && (
            <p>Preq: {getPreqLabels(props.preq)}</p>
          )}
          {isExpanded && props.coreq && props.coreq.length > 0 && (
            <p>Coreq: {getPreqLabels(props.coreq)}</p>
          )}
          {isExpanded && props.onToggleExtra && (
            <div
              className={`absolute top-0 right-10 text-[10px] font-medium leading-none rounded-full p-1 border border-black border-opacity-30 ${
                props.isExtra ? "bg-black bg-opacity-30" : "bg-white bg-opacity-20"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                props.onToggleExtra?.();
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== " ") return;
                e.stopPropagation();
                props.onToggleExtra?.();
              }}
              tabIndex={0}
              role="button"
              aria-pressed={Boolean(props.isExtra)}
              title="Extra course: not for degree credit"
              data-testid="toggle-ext"
            >
              EXT
            </div>
          )}
          {isExpanded && (
            <div // because button cannot be a child of a button
              className="absolute top-0 right-4 text-xs rounded-full p-1"
              onClick={handleEdit}
              onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== " ") return;
                e.preventDefault();
                e.stopPropagation();
                handleEdit();
              }}
              tabIndex={0}
              role="button"
              aria-label={`Edit ${props.code}`}
            >
              ✏️
            </div>
          )}
          {props.isExtra && (
            <span
              className="absolute top-0 left-0 text-xs bg-white bg-opacity-20 rounded-full p-1"
              data-testid="ext-badge"
            >
              EXT
            </span>
          )}
          {(() => {
            if (props.onlyF && props.onlyS) {
              console.warn(`WARNING: ${props.code} is marked as only fall and only winter`);
              return null;
            }

            let icon = null;
            if (props.onlyF) icon = "🍂";
            else if (props.onlyS) icon = "❄️";

            return icon && (
              <span className="absolute top-0 right-0 text-xs bg-white bg-opacity-20 rounded-full p-1">
                {icon}
              </span>
            );
          })()}
        </article>
        );
      }}
    </Draggable>
  );
};

export default MakerCard;
