import { describe, expect, it } from "vitest";
import {
  WHO5_QUESTIONS,
  WHO5_SCALE_MAX,
  WHO5_SCALE_MIN,
  calculateWho5Score,
  describeWho5Score,
} from "./who5";

describe("calculateWho5Score", () => {
  it("scores all-minimum answers as 0 raw / 0 percentage", () => {
    const responses = Array(WHO5_QUESTIONS.length).fill(WHO5_SCALE_MIN);
    expect(calculateWho5Score(responses)).toEqual({
      rawScore: 0,
      percentageScore: 0,
    });
  });

  it("scores all-maximum answers as 25 raw / 100 percentage", () => {
    const responses = Array(WHO5_QUESTIONS.length).fill(WHO5_SCALE_MAX);
    expect(calculateWho5Score(responses)).toEqual({
      rawScore: 25,
      percentageScore: 100,
    });
  });

  it("sums a typical mixed set of answers correctly", () => {
    // 3 + 4 + 2 + 5 + 1 = 15 raw -> 60 percentage
    expect(calculateWho5Score([3, 4, 2, 5, 1])).toEqual({
      rawScore: 15,
      percentageScore: 60,
    });
  });

  it("handles every single boundary value (0 and 5) individually", () => {
    expect(calculateWho5Score([0, 5, 0, 5, 0])).toEqual({
      rawScore: 10,
      percentageScore: 40,
    });
  });

  it("throws if fewer than 5 answers are provided", () => {
    expect(() => calculateWho5Score([1, 2, 3, 4])).toThrow(/exactly 5 answers/);
  });

  it("throws if more than 5 answers are provided", () => {
    expect(() => calculateWho5Score([1, 2, 3, 4, 5, 0])).toThrow(
      /exactly 5 answers/,
    );
  });

  it("throws if an answer is below the minimum", () => {
    expect(() => calculateWho5Score([-1, 2, 3, 4, 5])).toThrow(
      /between 0 and 5/,
    );
  });

  it("throws if an answer is above the maximum", () => {
    expect(() => calculateWho5Score([1, 2, 3, 4, 6])).toThrow(
      /between 0 and 5/,
    );
  });

  it("throws if an answer is not an integer", () => {
    expect(() => calculateWho5Score([1.5, 2, 3, 4, 5])).toThrow(
      /between 0 and 5/,
    );
  });
});

describe("describeWho5Score", () => {
  it("uses non-diagnostic, supportive language below 50", () => {
    const text = describeWho5Score(40);
    expect(text).toMatch(/isn't a diagnosis/i);
    expect(text).not.toMatch(
      /you have depression|you are depressed|diagnosed with/i,
    );
  });

  it("describes a moderate score between 50 and 74", () => {
    expect(describeWho5Score(60)).toMatch(/moderate/i);
  });

  it("describes a good score at 75 and above", () => {
    expect(describeWho5Score(80)).toMatch(/good level of wellbeing/i);
  });
});
