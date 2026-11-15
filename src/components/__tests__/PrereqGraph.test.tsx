import { fireEvent, render, screen, within } from "@testing-library/react";
import PrereqGraph from "../explorer/PrereqGraph";
import mockCourses from "../../data/mockCourses";
import { buildUnlocks } from "../../utils/prereqGraph";

const unlocks = buildUnlocks(mockCourses);

const renderGraph = (code: string, onSelect = jest.fn()) => {
  render(
    <PrereqGraph
      code={code}
      courses={mockCourses}
      unlocks={unlocks}
      onSelect={onSelect}
    />
  );
  return onSelect;
};

const nodeCodes = () =>
  screen.getAllByTestId("graph-node").map((n) => n.getAttribute("data-code"));

describe("PrereqGraph", () => {
  it("renders the course, its prerequisites and what it unlocks", () => {
    renderGraph("ECE464");
    const codes = nodeCodes();
    expect(codes).toContain("ECE464");
    expect(codes).toContain("ECE302");
    expect(codes).toContain("ECE316");
  });

  it("puts the options of a 'one of' group in a box", () => {
    renderGraph("ECE427");
    const box = screen.getByTestId("one-of-box");
    expect(within(box).getByText("ECE318")).toBeInTheDocument();
    expect(within(box).getByText("ECE320")).toBeInTheDocument();
    expect(within(box).getByText("one of")).toBeInTheDocument();
  });

  it("selects a course when its node is clicked", () => {
    const onSelect = renderGraph("ECE464");
    fireEvent.click(screen.getAllByRole("button", { name: /ECE316/ })[0]);
    expect(onSelect).toHaveBeenCalledWith("ECE316");
  });

  it("does not make the selected course or a course outside the list a button", () => {
    renderGraph("ECE435");
    expect(screen.queryByRole("button", { name: /ECE435/ })).not.toBeInTheDocument();
    // MIE286 is not in the course list
    expect(screen.getByText("MIE286")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /MIE286/ })).not.toBeInTheDocument();
  });

  it("draws corequisite edges dashed and says when there are no links", () => {
    const courses = { A: { name: "a" }, B: { name: "b", coreq: ["A"] }, C: { name: "c" } };
    const { rerender } = render(
      <PrereqGraph code="B" courses={courses} unlocks={buildUnlocks(courses)} onSelect={jest.fn()} />
    );
    expect(screen.getByTestId("graph-edge")).toHaveAttribute("data-kind", "coreq");
    rerender(
      <PrereqGraph code="C" courses={courses} unlocks={buildUnlocks(courses)} onSelect={jest.fn()} />
    );
    expect(screen.getByText(/No prerequisites, and not a prerequisite/)).toBeInTheDocument();
  });
});
