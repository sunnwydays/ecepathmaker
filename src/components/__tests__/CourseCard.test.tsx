import { render, screen } from "@testing-library/react";
import { DraggableCardProps } from "../../types/types";
import { CourseCard } from "../../utils/componentImports";

describe("CourseCard", () => {
  const courseDetails: DraggableCardProps = {
    id: "ECE452",
    code: "ECE452",
    name: "I made this up",
    preq: ["ECE345"],
    streams: [1],
    onlyF: true,
    isCS: true,
    index: -1
  };

  it("renders course details correctly", () => {
    render(<CourseCard {...courseDetails} />);

    // Check course code and name
    expect(screen.getByTestId("course-code")).toHaveTextContent("ECE452");
    expect(screen.getByText(/I made this up/)).toBeInTheDocument();

    // Check stream 1 indicator
    expect(screen.getByText("Streams: 1")).toBeInTheDocument();

    // Check prerequisite
    expect(screen.getByText("Prerequisites: ECE345")).toBeInTheDocument();

    // Check CS indicator
    expect(screen.getByText(/CS/)).toBeInTheDocument();

    // Check Fall-only indicator
    expect(screen.getByText(/Fall/i)).toBeInTheDocument();

    // Check background colour
    const cardContainer = screen.getByTestId("card-container");
    expect(cardContainer).toHaveStyle({ backgroundColor: "#fa7274" });
  });
});
