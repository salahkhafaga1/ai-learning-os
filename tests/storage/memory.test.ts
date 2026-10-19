import { describe, expect, it } from "vitest";
import { createSeedState } from "@/data/seed";
import { createMemoryRepository } from "@/lib/storage/memory";

describe("createMemoryRepository", () => {
  it("starts fresh with a state deep-equal to the seed", () => {
    const repo = createMemoryRepository();
    expect(repo.kind).toBe("memory");
    const result = repo.load();
    expect(result.status).toBe("fresh");
    expect(result.warning).toBeUndefined();
    expect(result.state).toEqual(createSeedState());
  });

  it("roundtrips a saved state as loaded", () => {
    const repo = createMemoryRepository();
    const state = createSeedState();
    state.taskStatus["w1-t1"] = "done";
    state.sessions.push({
      id: "s1",
      date: "2026-10-20",
      topic: "أساسيات التنسورات",
      minutes: 45,
      activity: "reading",
      learned: "فهمت قواعد الـ broadcasting",
      implemented: "تنفيذ تمارين التنسورات",
      questions: "",
      createdAt: "2026-10-20T10:00:00.000Z",
    });
    expect(repo.save(state)).toEqual({ ok: true });
    const result = repo.load();
    expect(result.status).toBe("loaded");
    expect(result.state).toEqual(state);
  });

  it("resets back to fresh after saving", () => {
    const repo = createMemoryRepository();
    const state = createSeedState();
    state.taskStatus["w1-t1"] = "done";
    repo.save(state);
    repo.reset();
    const result = repo.load();
    expect(result.status).toBe("fresh");
    expect(result.state.taskStatus["w1-t1"]).toBe("todo");
    expect(result.state).toEqual(createSeedState());
  });

  it("isolates stored state from later caller and reader mutations", () => {
    const repo = createMemoryRepository();
    const state = createSeedState();
    repo.save(state);
    state.taskStatus["w1-t1"] = "done";
    const first = repo.load();
    expect(first.state.taskStatus["w1-t1"]).toBe("todo");
    first.state.taskStatus["w1-t2"] = "done";
    const second = repo.load();
    expect(second.state.taskStatus["w1-t2"]).toBe("todo");
  });

  it("serves the most recently saved state", () => {
    const repo = createMemoryRepository();
    const first = createSeedState();
    first.weekNotes["1"] = "الملاحظة الأولى";
    repo.save(first);
    const second = createSeedState();
    second.weekNotes["1"] = "الملاحظة الثانية";
    repo.save(second);
    expect(repo.load().state.weekNotes["1"]).toBe("الملاحظة الثانية");
  });
});
