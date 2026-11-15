import { courseUpdates, COURSE_DATA_VERSION } from "../courseUpdates";
import mockCourses from "../mockCourses";

describe("courseUpdates", () => {
  it("has strictly increasing versions starting at 1", () => {
    courseUpdates.forEach((update, i) => {
      expect(update.version).toBe(i + 1);
    });
    expect(COURSE_DATA_VERSION).toBe(courseUpdates.length);
  });

  it("only upserts codes that exist in mockCourses", () => {
    courseUpdates.forEach((update) => {
      (update.upsert ?? []).forEach((code) => {
        expect(mockCourses).toHaveProperty(code);
      });
    });
  });
});
