import { FC } from "react";
import { MakerCardProps } from "../../types/types";
import { Draggable } from "../../utils/componentImports";
import {
  getTextColor,
  getBackgroundColor,
  getOtherLabels,
  getPreqLabels,
  getStreamLabels,
} from "../../utils/utilImports";

const MakerCard: FC<MakerCardProps> = (props) => {
  const textColor = getTextColor(props.color);

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
    <Draggable id={props.id}>
      {(isExpanded) => (
        <article
          className={`
                    text-xs
                    ${
                      isExpanded
                        ? "size-[10rem] border-2 border-black border-opacity-20"
                        : "size-32"
                    }
                    transition-[width,height]
                    flex flex-col items-center justify-center 
                    rounded-md
                    relative
                    ${props.valid ? textColor : "text-black text-opacity-40"}
                `}
          style={{
            backgroundColor: props.valid
              ? getBackgroundColor(props.color, props.streams?.[0], props.isSciMath, props.isCS, props.isHSS)
              : "rgba(255, 111, 97, 0.7)",
          }}
        >
          <h1 className="text-xl font-medium">{props.code}</h1>
          <p
            className={`${
              isExpanded ? "w-36 line-clamp-3" : "w-28 line-clamp-2"
            } text-center text-sm transition-width]`}
          >
            {props.name}
          </p>
          {getStreamLabels(props) && <p>Stream: {getStreamLabels(props)}</p>}
          {getOtherLabels(props) && <p>{getOtherLabels(props)}</p>}
          {isExpanded && props.preq && props.preq.length > 0 && (
            <p>Preq: {getPreqLabels(props.preq)}</p>
          )}
          {isExpanded && props.coreq && props.coreq.length > 0 && (
            <p>Coreq: {getPreqLabels(props.coreq)}</p>
          )}
          {isExpanded && (
            <div // because button cannot be a child of a button
              className="absolute top-0 right-4 text-xs rouned-full p-1"
              onClick={handleEdit}
              onKeyDown={handleEdit}
              tabIndex={0}
              role="button"
            >
              ✏️
            </div>
          )}
          {props.onlyF && (
            <span className="absolute top-0 right-0 text-xs bg-white bg-opacity-20 rounded-full p-1">
              🍂
            </span>
          )}
          {props.onlyS && (
            <span className="absolute top-0 right-0 text-xs bg-white bg-opacity-20 rounded-full p-1">
              ❄️
            </span>
          )}
        </article>
      )}
    </Draggable>
  );
};

export default MakerCard;
