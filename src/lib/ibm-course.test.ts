import { describe, expect, it } from "vitest";
import {
  certificateProgress,
  completedCourseCount,
  IBM_CERTIFICATE_HOURS,
  IBM_FULL_STACK_COURSES,
} from "./ibm-course";

describe("IBM certificate roadmap", () => {
  it("tracks the complete 15-course certificate in the published order", () => {
    expect(IBM_FULL_STACK_COURSES).toHaveLength(15);
    expect(IBM_FULL_STACK_COURSES[0].title).toBe("Introduction to Software Engineering");
    expect(IBM_FULL_STACK_COURSES.at(-1)?.title).toBe("Software Developer Career Guide and Interview Preparation");
    expect(IBM_CERTIFICATE_HOURS).toBe(228);
  });

  it("calculates overall roadmap progress from per-course values", () => {
    const firstCourse = IBM_FULL_STACK_COURSES[0].id;
    const secondCourse = IBM_FULL_STACK_COURSES[1].id;
    expect(certificateProgress({ [firstCourse]: 100, [secondCourse]: 50 })).toBe(10);
  });

  it("counts only fully completed courses and clamps invalid progress", () => {
    const firstCourse = IBM_FULL_STACK_COURSES[0].id;
    const secondCourse = IBM_FULL_STACK_COURSES[1].id;
    expect(completedCourseCount({ [firstCourse]: 100, [secondCourse]: 75 })).toBe(1);
    expect(certificateProgress({ [firstCourse]: 300, [secondCourse]: -50 })).toBe(7);
  });
});
