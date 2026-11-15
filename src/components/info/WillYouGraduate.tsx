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

  const renderResult = (r: RequirementResult) => (
    <li key={r.id} className="flex items-center">
      {r.label}
      <ClickableTooltip>{r.tooltip}</ClickableTooltip>:{" "}
      <Tick met={r.met} />
      {r.showProgress && ` (${r.have}/${r.need})`}
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
                {r.id === "depth" && result.depthGroups.length > 0 && (
                  <li>Possible depth streams:{result.depthGroups.join(", ")}</li>
                )}
                {r.id === "breadth" && result.breadthGroups.length > 0 && (
                  <li>Other kernel streams:{result.breadthGroups.join(", ")}</li>
                )}
              </Fragment>
            ))}

            {curriculum.designation.type === "derived" ? (
              <li>
                CE/EE:{" "}
                {result.designation ? (
                  <b className="font-semibold">
                    {DESIGNATION_TEXT[result.designation]}
                  </b>
                ) : (
                  "none"
                )}
              </li>
            ) : (
              <li>
                Program:{" "}
                {result.designation && (
                  <b className="font-semibold">
                    {DESIGNATION_TEXT[result.designation]}
                  </b>
                )}
              </li>
            )}
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
        </div>
      </div>
      <div
        className="
                mt-4 p-8 flex flex-col items-center justify-center 
                w-full bg-neutral1 dark:bg-gray-800 rounded shadow"
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
