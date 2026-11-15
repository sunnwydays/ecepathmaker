import { FC, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CourseList, CoursesOnGrid, CoursesUsed } from "../../types/types";
import { CourseStatus, describeStatus, getCourseStatus } from "../../utils/courseStatus";
import {
  EdgeKind,
  FocusGraph,
  FocusNode,
  Unlock,
  buildFocusGraph,
} from "../../utils/prereqGraph";

interface PrereqGraphProps {
  code: string;
  courses: CourseList;
  unlocks: Map<string, Unlock[]>;
  coursesUsed: CoursesUsed;
  coursesOnGrid: CoursesOnGrid;
  onSelect: (code: string) => void;
}

interface DrawnEdge {
  key: string;
  d: string;
  kind: EdgeKind;
  from: string;
  to: string;
}

const NODE_WIDTH = "w-44";

const nodeBase =
  "rounded-md border-2 px-2 py-1.5 text-left text-sm leading-tight dark:text-gray-50";

const Node: FC<{
  node: FocusNode;
  name?: string;
  status: CourseStatus;
  focused: boolean;
  register: (id: string, el: HTMLElement | null) => void;
  onSelect: (code: string) => void;
  onHover: (id: string | null) => void;
}> = ({ node, name, status, focused, register, onSelect, onHover }) => {
  const statusText = describeStatus(status);
  const mark =
    status.kind === "onGrid" || status.kind === "taken"
      ? "✓ "
      : status.kind === "canTake"
      ? "→ "
      : status.kind === "missing"
      ? "! "
      : "";
  const content = (
    <>
      <span className="block font-semibold">{node.code}</span>
      {name && <span className="block text-xs opacity-80">{name}</span>}
      {statusText && (
        <span className="mt-0.5 block text-xs font-medium">
          {mark}
          {statusText}
        </span>
      )}
    </>
  );

  if (focused) {
    return (
      <div
        ref={(el) => register(node.id, el)}
        aria-current="true"
        data-testid="graph-node"
        data-code={node.code}
        className={`${nodeBase} ${NODE_WIDTH} bg-green1 dark:bg-green3 border-green4 dark:border-green1`}
      >
        {content}
      </div>
    );
  }
  if (!node.inList || status.kind === "taken") {
    return (
      <div
        ref={(el) => register(node.id, el)}
        data-testid="graph-node"
        data-code={node.code}
        title={
          status.kind === "taken"
            ? "First- or second-year course, assumed taken"
            : "Not in the course list"
        }
        className={`${nodeBase} ${NODE_WIDTH} border-dashed border-neutral3 bg-transparent text-gray-500 dark:text-gray-300`}
      >
        {content}
      </div>
    );
  }
  return (
    <button
      type="button"
      ref={(el) => register(node.id, el)}
      data-testid="graph-node"
      data-code={node.code}
      onClick={() => onSelect(node.code)}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(node.id)}
      onBlur={() => onHover(null)}
      className={`${nodeBase} ${NODE_WIDTH} ${
        status.kind === "onGrid"
          ? "border-green4 dark:border-green1"
          : status.kind === "missing"
          ? "border-comp3"
          : "border-neutral3"
      } bg-white dark:bg-gray-500 hover:border-green4 dark:hover:border-green1`}
    >
      {content}
    </button>
  );
};

const PrereqGraph: FC<PrereqGraphProps> = ({
  code,
  courses,
  unlocks,
  coursesUsed,
  coursesOnGrid,
  onSelect,
}) => {
  const graph: FocusGraph = useMemo(
    () => buildFocusGraph(code, courses, unlocks),
    [code, courses, unlocks]
  );

  const innerRef = useRef<HTMLDivElement>(null);
  const elements = useRef(new Map<string, HTMLElement>());
  const [edges, setEdges] = useState<DrawnEdge[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);

  const register = useCallback((id: string, el: HTMLElement | null) => {
    if (el) elements.current.set(id, el);
    else elements.current.delete(id);
  }, []);

  // Measure the nodes and draw a curve between each pair of connected ones
  const measure = useCallback(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const origin = inner.getBoundingClientRect();
    const drawn: DrawnEdge[] = [];
    for (const edge of graph.edges) {
      const from = elements.current.get(edge.from);
      const to = elements.current.get(edge.to);
      if (!from || !to) continue;
      const a = from.getBoundingClientRect();
      const b = to.getBoundingClientRect();
      const x1 = a.right - origin.left;
      const y1 = a.top + a.height / 2 - origin.top;
      const x2 = b.left - origin.left;
      const y2 = b.top + b.height / 2 - origin.top;
      const mid = (x1 + x2) / 2;
      drawn.push({
        key: `${edge.from}>${edge.to}`,
        d: `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`,
        kind: edge.kind,
        from: edge.from,
        to: edge.to,
      });
    }
    setEdges(drawn);
  }, [graph]);

  useLayoutEffect(() => {
    measure();
    const inner = innerRef.current;
    if (!inner || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [measure]);

  const columns = useMemo(() => {
    const byColumn = new Map<number, FocusNode[]>();
    for (const node of graph.nodes) {
      byColumn.set(node.column, [...(byColumn.get(node.column) ?? []), node]);
    }
    return [...byColumn.entries()].sort(([a], [b]) => a - b);
  }, [graph]);

  const groupOf = (nodeId: string) =>
    graph.groups.find((g) => g.nodeIds.includes(nodeId));

  // The edges touching the hovered node (or the "one of" box around it)
  const touching = (edge: DrawnEdge) => {
    if (!hovered) return false;
    const group = groupOf(hovered);
    return [hovered, group?.id].some((id) => id && (edge.from === id || edge.to === id));
  };

  const renderNode = (node: FocusNode) => (
    <Node
      key={node.id}
      node={node}
      name={courses[node.code]?.name}
      status={getCourseStatus(node.code, courses, coursesUsed, coursesOnGrid)}
      focused={node.id === `0:${code}`}
      register={register}
      onSelect={onSelect}
      onHover={setHovered}
    />
  );

  const renderColumn = (nodes: FocusNode[]) => {
    const done = new Set<string>();
    return nodes.map((node) => {
      if (done.has(node.id)) return null;
      const group = groupOf(node.id);
      if (!group) return renderNode(node);
      group.nodeIds.forEach((id) => done.add(id));
      return (
        <div
          key={group.id}
          ref={(el) => register(group.id, el)}
          data-testid="one-of-box"
          className="flex flex-col gap-2 rounded-lg border-2 border-dashed border-neutral3 p-2 dark:text-gray-50"
        >
          <span className="text-xs italic">one of</span>
          {group.nodeIds.map((id) => {
            const member = nodes.find((n) => n.id === id);
            return member ? renderNode(member) : null;
          })}
        </div>
      );
    });
  };

  const hasLinks = graph.nodes.length > 1;

  return (
    <div className="flex flex-col gap-2" data-testid="prereq-graph">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h4 className="font-semibold dark:text-gray-50">Prerequisite graph</h4>
        <span className="flex items-center gap-4 text-xs dark:text-gray-50">
          <span className="flex items-center gap-1">
            <svg width="28" height="6" aria-hidden="true">
              <line x1="0" y1="3" x2="28" y2="3" stroke="currentColor" strokeWidth="2" />
            </svg>
            prerequisite
          </span>
          <span className="flex items-center gap-1">
            <svg width="28" height="6" aria-hidden="true">
              <line
                x1="0"
                y1="3"
                x2="28"
                y2="3"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
            </svg>
            corequisite
          </span>
        </span>
      </div>
      {!hasLinks && (
        <p className="text-sm italic dark:text-gray-50">
          No prerequisites, and not a prerequisite of any course
        </p>
      )}
      <div className="overflow-x-auto">
        <div
          key={code}
          ref={innerRef}
          className="relative flex min-w-max items-center gap-14 p-1 animate-in fade-in duration-200"
        >
          <svg
            className="absolute inset-0 h-full w-full overflow-visible pointer-events-none text-gray-400 dark:text-gray-300"
            aria-hidden="true"
          >
            {edges.map((edge) => (
              <path
                key={edge.key}
                d={edge.d}
                fill="none"
                stroke="currentColor"
                strokeWidth={touching(edge) ? 3 : 1.5}
                strokeDasharray={edge.kind === "coreq" ? "6 4" : undefined}
                className={`transition-all ${
                  touching(edge)
                    ? "text-green4 dark:text-green1"
                    : hovered
                    ? "opacity-30"
                    : ""
                }`}
                data-testid="graph-edge"
                data-kind={edge.kind}
              />
            ))}
          </svg>
          {columns.map(([column, nodes]) => (
            <div
              key={column}
              className="relative flex flex-col justify-center gap-3"
              data-column={column}
            >
              {renderColumn(nodes)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrereqGraph;
