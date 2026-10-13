import { describe, expect, it } from "vitest";
import { scoreGad7 } from "./gad7";
import { SCENES, buildStory, recommend, scorePatterns, type ProfileAnswers } from "./profile";
import { regionFromCountry } from "./regions";

function answers(over: Partial<Record<string, number>>, rest: Partial<ProfileAnswers> = {}): ProfileAnswers {
  return {
    scenes: Object.fromEntries(SCENES.map((s) => [s.key, over[s.key] ?? 0])),
    topic: "work",
    when: "night",
    control: "act",
    ...rest,
  };
}

describe("scoreGad7", () => {
  it("uses the published 5/10/15 cut-offs", () => {
    expect(scoreGad7([0, 0, 0, 0, 1, 1, 2]).band).toBe("minimal");
    expect(scoreGad7([1, 1, 1, 1, 1, 0, 0]).band).toBe("mild");
    expect(scoreGad7([2, 2, 2, 2, 1, 1, 0]).band).toBe("moderate");
    expect(scoreGad7([3, 3, 3, 2, 2, 1, 1]).band).toBe("severe");
    expect(scoreGad7([3, 3, 3, 3, 3, 3, 3]).total).toBe(21);
  });
  it("rejects incomplete answers", () => {
    expect(() => scoreGad7([1, 2])).toThrow();
  });
});

describe("profile", () => {
  it("picks the loudest pattern and says so", () => {
    const a = answers({ body_rush: 3, body_tense: 3, worry_story: 1 });
    const story = buildStory(a, scorePatterns(a.scenes));
    expect(story.top.key).toBe("body");
    expect(story.quote).toContain("chest tightens");
    expect(story.lead).toContain("work");
  });

  it("calls night-time worry the 3am loop", () => {
    const a = answers({ worry_story: 3, worry_circle: 3 });
    expect(buildStory(a, scorePatterns(a.scenes)).headline).toContain("3am");
  });

  it("is deterministic on ties", () => {
    const a = answers({ worry_story: 3, worry_circle: 3, body_rush: 3, body_tense: 3 });
    expect(buildStory(a, scorePatterns(a.scenes)).top.key).toBe("worry");
  });

  it("routes worry about something unchangeable to Make Room, otherwise Find a Way", () => {
    const loud = { worry_story: 3, worry_circle: 2 };
    expect(recommend(answers(loud, { control: "cannot" }), scorePatterns(answers(loud).scenes)).practice).toContain("Make Room");
    expect(recommend(answers(loud, { control: "act" }), scorePatterns(answers(loud).scenes)).practice).toContain("Find a Way");
  });

  it("does not invent a problem when nothing is loud", () => {
    const a = answers({ worry_story: 1 });
    expect(recommend(a, scorePatterns(a.scenes)).step).toContain("steady");
  });

  it("every pattern has a recommendation naming Saati", () => {
    for (const s of SCENES) {
      const a = answers({ [s.key]: 3 });
      const r = recommend(a, scorePatterns(a.scenes));
      expect(r.saatiHelp).toContain("Saati");
      expect(r.buttonLabel).toContain("Saati");
    }
  });
});

describe("regionFromCountry", () => {
  it("maps the four countries and falls back", () => {
    expect(regionFromCountry("gb")).toBe("GB");
    expect(regionFromCountry("CA")).toBe("CA");
    expect(regionFromCountry("DE")).toBe("OTHER");
    expect(regionFromCountry(null)).toBe("OTHER");
  });
});
