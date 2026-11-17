import { FC, Fragment, useEffect, useRef, useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import {
  Curriculum,
  Designation,
  EvaluationResult,
  RequirementResult,
} from "../../requirements/types";
import { ClickableTooltip } from "../../utils/componentImports";
import { useDarkMode } from "../../utils/utilImports";
import { panelEdge } from "../../styles/ui";

interface WillYouGraduateProps {
  result: EvaluationResult;
  curriculum: Curriculum;
}

const DESIGNATION_TEXT: Record<Designation, string> = {
  CE: "CE 🖥",
  ECE: "CE or EE ⚡",
  EE: "EE 🔌",
};

// ✅/❌ that pops in when its value flips, not when it first appears
const Tick: FC<{ met: boolean }> = ({ met }) => {
  const first = useRef(true);
  const [flips, setFlips] = useState(0);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setFlips((n) => n + 1);
  }, [met]);

  return (
    <span key={flips} className={flips ? "animate-in zoom-in-75 duration-150" : undefined}>
      {met ? "✅" : "❌"}
    </span>
  );
};

const WillYouGraduate: FC<WillYouGraduateProps> = ({ result, curriculum }) => {
  const basics = result.results.filter((r) => r.section === "basics");
  const groupResults = result.results.filter((r) => r.section === "groups");

  const designationLabel =
    curriculum.designation.type === "derived" ? "CE/EE" : "Program";
  const rowClass = "flex items-center gap-1 max-w-60";
  const muted = "text-neutral-500 dark:text-gray-400";

  const renderResult = (r: RequirementResult) => (
    <li
      key={r.id}
      className={rowClass}
      aria-label={`${r.label}: ${r.met ? "✅" : "❌"}${
        r.showProgress ? ` (${r.have}/${r.need})` : ""
      }`}
    >
      {r.label}
      <ClickableTooltip>{r.tooltip}</ClickableTooltip>
      <span className="ml-auto flex items-center gap-1.5 tabular-nums">
        {r.showProgress && (
          <span className={`text-sm ${muted}`}>
            {r.have}/{r.need}
          </span>
        )}
        <Tick met={r.met} />
      </span>
    </li>
  );

  // Indented note under a rule, e.g. which streams can be depth
  const renderNote = (label: string, groups: string[]) => (
    <li
      className={`ml-1 pl-3 border-l-2 border-neutral-300 dark:border-gray-600 text-sm ${muted}`}
    >
      {label}: {groups.join(", ")}
    </li>
  );

  const chartGroups = curriculum.groups.filter(
    (g) => result.groupCounts[g.id] > 0
  );
  const streams = chartGroups.map((g) => g.label);
  const counts = chartGroups.map((g) => result.groupCounts[g.id]);
  const colors = chartGroups.map((g) => g.chartColor);

  const isDarkMode = useDarkMode();
  const axisColor = isDarkMode ? '#f9fafb' : '#000000'; // gray-50 / black

  const otherChartSettings = {
    width: 220,
    height: 170,
    margin: { top: 10, bottom: 40, left: 28, right: 0 },
    borderRadius: 5,
  };

  return (
    <div className="mt-6 dark:text-gray-200">
      <div className="grid grid-cols-3 gap-3">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-1">Basics</h3>
          <ul className="space-y-1">
            {basics.map(renderResult)}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-1">Depth and Breadth</h3>
          <ul className="space-y-1">
            {groupResults.map((r) => (
              <Fragment key={r.id}>
                {renderResult(r)}
                {r.id === "depth" &&
                  result.depthGroups.length > 0 &&
                  renderNote("Depth streams", result.depthGroups)}
                {r.id === "breadth" &&
                  result.breadthGroups.length > 0 &&
                  renderNote("Other kernel streams", result.breadthGroups)}
              </Fragment>
            ))}

            <li
              className={`${rowClass} mt-2 pt-2 border-t border-neutral-300 dark:border-gray-600`}
              aria-label={`${designationLabel}: ${
                result.designation
                  ? DESIGNATION_TEXT[result.designation]
                  : "none yet"
              }`}
            >
              {designationLabel}
              <span className="ml-auto">
                {result.designation ? (
                  <b className="font-semibold">
                    {DESIGNATION_TEXT[result.designation]}
                  </b>
                ) : (
                  <span className={muted}>none yet</span>
                )}
              </span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-1">Courses per stream</h3>
          {streams.length > 0 ? (
            <BarChart
            xAxis={[
              {
                id: "streamCategories",
                data: streams,
                scaleType: "band",
                colorMap: {
                  type: "ordinal",
                  colors: colors,
                },
                label: "Stream",
                labelStyle: {
                  fill: axisColor,
                },
                tickLabelStyle: {
                  fill: axisColor,
                },
              },
            ]}
            yAxis={[
              {
                tickLabelStyle: {
                  fill: axisColor,
                },
              },
              
            ]}
              series={[
                {
                  data: counts,
                },
              ]}
              {...otherChartSettings}
            />
          ) : (
            <p className="text-neutral3 italic select-none">
              No courses in any stream yet
            </p>
          )}
          <ul className="mt-2 text-sm space-y-0.5">
            {curriculum.groups.map((g) => {
              const list = result.groupCourses[g.id];
              return (
                <li key={g.id}>
                  <span className="font-semibold">{g.label}:</span>{" "}
                  {list.length === 0 ? (
                    <span className="text-neutral3">none</span>
                  ) : (
                    list.map((c, i) => (
                      <Fragment key={c.code}>
                        {i > 0 && ", "}
                        {c.kernel ? (
                          <b className="font-semibold underline">{c.code}</b>
                        ) : (
                          c.code
                        )}
                      </Fragment>
                    ))
                  )}
                </li>
              );
            })}
            {curriculum.groups.some((g) =>
              result.groupCourses[g.id].some((c) => c.kernel)
            ) && (
              <li className="text-neutral3">
                <b className="font-semibold underline">Underlined</b> = kernel
              </li>
            )}
          </ul>
        </div>
      </div>
      <div
        className={`
                mt-4 p-8 flex flex-col items-center justify-center 
                w-full bg-neutral1 dark:bg-gray-800 ${panelEdge}`}
      >
        {result.graduates ? (
          <h2 className="text-2xl font-semibold text-green3">
            🎓 You graduate
          </h2>
        ) : (
          <h2 className="text-2xl font-semibold text-comp3">
            😅 You are not graduating with this one
          </h2>
        )}
        <div className="text-neutral-500 dark:text-gray-400 mt-4 text-sm">
          <p>Check on your own: {curriculum.manualChecks}</p>
          <p>
            Known concerns:{" "}
            {curriculum.membership && (
              <>
                <b className="font-medium">
                  Custom courses placed in a group are not checked against the
                  calendar's lists
                </b>
                ,{" "}
              </>
            )}
            dragging a course with prereq then removing prereq, no minor/cert
            check.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WillYouGraduate;
