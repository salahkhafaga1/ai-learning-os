import { describe, expect, it } from "vitest";
import { allWeeks } from "@/data/phases";
import { roadmap } from "@/data/roadmap";
import { createSeedState } from "@/data/seed";
import { effectiveWeekRange } from "@/domain/dates";
import { overdueTasks } from "@/domain/progress";
import type { StudySession, TaskStatus } from "@/domain/types";
import {
  selectDashboard,
  sessionsInRange,
  sessionsToday,
  sumMinutes,
} from "@/lib/state/selectors";

const TODAY = "2026-10-22"; // inside week 1 (2026-10-20 … 2026-10-26)

function session(id: string, date: string, minutes: number): StudySession {
  return {
    id,
    date,
    topic: `موضوع ${id}`,
    minutes,
    activity: "reading",
    learned: "",
    implemented: "",
    questions: "",
    createdAt: `${date}T08:00:00.000Z`,
  };
}

function allTasksDone(): Record<string, TaskStatus> {
  return Object.fromEntries(
    allWeeks
      .flatMap((week) => week.tasks)
      .map((task) => [task.id, "done" as TaskStatus]),
  );
}

describe("session helpers", () => {
  it("sessionsToday returns only sessions on the exact date", () => {
    const sessions = [
      session("a", "2026-10-22", 10),
      session("b", "2026-10-21", 20),
    ];
    expect(sessionsToday(sessions, "2026-10-22").map((s) => s.id)).toEqual([
      "a",
    ]);
    expect(sessionsToday(sessions, "2026-10-20")).toEqual([]);
  });

  it("sessionsInRange is inclusive on both ends", () => {
    const sessions = [
      session("a", "2026-10-20", 10),
      session("b", "2026-10-21", 20),
      session("c", "2026-10-26", 30),
      session("d", "2026-10-27", 40),
    ];
    expect(
      sessionsInRange(sessions, "2026-10-20", "2026-10-26").map((s) => s.id),
    ).toEqual(["a", "b", "c"]);
  });

  it("sumMinutes adds session minutes and starts at zero", () => {
    expect(
      sumMinutes([
        session("a", "2026-10-22", 10),
        session("b", "2026-10-21", 20),
      ]),
    ).toBe(30);
    expect(sumMinutes([])).toBe(0);
  });
});

describe("selectDashboard time totals", () => {
  it("derives every time bucket from sessions only", () => {
    const state = createSeedState();
    state.sessions = [
      session("s1", TODAY, 30),
      session("s2", "2026-10-21", 20),
      session("s3", "2026-10-19", 15), // yesterday: within 7 days, before week 1
      session("s4", "2026-09-01", 100), // long before the roadmap
      session("s5", "2026-11-10", 45), // week 4, beyond 7 days
    ];

    const model = selectDashboard(roadmap, state, TODAY);

    expect(model.time).toEqual({
      totalMinutes: 210,
      todayMinutes: 30,
      thisWeekMinutes: 50,
      last7DaysMinutes: 65,
    });
  });

  it("does not change logged time when tasks are completed", () => {
    const state = createSeedState();
    state.sessions = [session("s1", TODAY, 30), session("s2", "2026-10-21", 20)];
    const before = selectDashboard(roadmap, state, TODAY);

    state.taskStatus = allTasksDone();
    const after = selectDashboard(roadmap, state, TODAY);

    expect(after.time).toEqual(before.time);
    expect(after.overall.percent).toBe(100);
    expect(after.overall.completed).toBe(after.overall.eligible);
  });
});

describe("selectDashboard fresh state", () => {
  it("reports zeros without fabricating progress", () => {
    const state = createSeedState();
    const total = allWeeks.flatMap((week) => week.tasks).length;

    const model = selectDashboard(roadmap, state, TODAY);

    expect(model.overall).toEqual({
      completed: 0,
      eligible: total,
      percent: 0,
    });
    expect(model.weeks).toEqual({ completed: 0, total: 37 });
    expect(model.time).toEqual({
      totalMinutes: 0,
      todayMinutes: 0,
      thisWeekMinutes: 0,
      last7DaysMinutes: 0,
    });
    expect(model.activityByWeek).toEqual([]);
    expect(model.overdue).toEqual([]);
    expect(model.blocked).toEqual([]);
    expect(model.issues).toEqual([]);
    expect(model.taskCounts).toEqual({ done: 0, pending: total, blocked: 0 });
    expect(model.current?.week.number).toBe(1);
    expect(model.current?.phase.id).toBe(allWeeks[0].phaseId);
    expect(model.current?.range).toEqual(
      effectiveWeekRange(1, state.settings, state.weekDateOverrides),
    );
    expect(model.next?.task.id).toBe(allWeeks[0].tasks[0].id);
  });
});

describe("selectDashboard phases and weeks", () => {
  it("summarizes every phase with effective range and status", () => {
    const state = createSeedState();
    const model = selectDashboard(roadmap, state, TODAY);

    expect(model.phases).toHaveLength(8);
    for (const entry of model.phases) {
      const numbers = [...entry.phase.weekNumbers].sort((a, b) => a - b);
      expect(entry.range).toEqual({
        start: effectiveWeekRange(
          numbers[0],
          state.settings,
          state.weekDateOverrides,
        ).start,
        end: effectiveWeekRange(
          numbers[numbers.length - 1],
          state.settings,
          state.weekDateOverrides,
        ).end,
      });
      expect(entry.status).toBe("not_started");
      expect(entry.progress.completed).toBe(0);
      expect(entry.progress.eligible).toBeGreaterThan(0);
    }
  });

  it("moves phase status through in_progress, blocked, completed", () => {
    const state = createSeedState();
    const phase1 = roadmap.phases.find((p) => p.id === "phase-1");
    expect(phase1).toBeDefined();
    if (!phase1) {
      throw new Error("phase-1 missing from roadmap");
    }
    const phase1Weeks = allWeeks.filter((w) => w.phaseId === phase1.id);

    state.taskStatus[phase1Weeks[0].tasks[0].id] = "in_progress";
    let entry = selectDashboard(roadmap, state, TODAY).phases.find(
      (e) => e.phase.id === phase1.id,
    );
    expect(entry?.status).toBe("in_progress");

    state.taskStatus[phase1Weeks[0].tasks[1].id] = "blocked";
    entry = selectDashboard(roadmap, state, TODAY).phases.find(
      (e) => e.phase.id === phase1.id,
    );
    expect(entry?.status).toBe("blocked");

    for (const week of phase1Weeks) {
      for (const task of week.tasks) {
        state.taskStatus[task.id] = "done";
      }
    }
    const model = selectDashboard(roadmap, state, TODAY);
    entry = model.phases.find((e) => e.phase.id === phase1.id);
    expect(entry?.status).toBe("completed");
    expect(entry?.progress.percent).toBe(100);
    expect(model.weeks.completed).toBe(phase1Weeks.length);
  });

  it("counts task statuses for done, pending, and blocked", () => {
    const state = createSeedState();
    const total = allWeeks.flatMap((week) => week.tasks).length;
    state.taskStatus[allWeeks[0].tasks[0].id] = "done";
    state.taskStatus[allWeeks[0].tasks[1].id] = "done";
    state.taskStatus[allWeeks[1].tasks[0].id] = "blocked";
    state.taskStatus[allWeeks[1].tasks[1].id] = "in_progress";
    state.taskStatus[allWeeks[2].tasks[0].id] = "skipped";

    const model = selectDashboard(roadmap, state, TODAY);

    expect(model.taskCounts).toEqual({
      done: 2,
      blocked: 1,
      pending: total - 5 + 1,
    });
  });
});

describe("selectDashboard current week", () => {
  it("follows currentWeekNumber and effective ranges under overrides", () => {
    const state = createSeedState();
    state.weekDateOverrides = { "1": "2026-10-08" };
    state.sessions = [
      session("x", "2026-10-13", 20), // shifted week 1 (2026-10-08 … 10-14)
      session("y", TODAY, 45), // now falls in a schedule gap
      session("z", "2026-10-28", 30), // week 2 (2026-10-27 … 11-02)
    ];

    const model = selectDashboard(roadmap, state, TODAY);

    expect(model.current?.week.number).toBe(2);
    expect(model.current?.range).toEqual({
      start: "2026-10-27",
      end: "2026-11-02",
    });
    expect(model.time.thisWeekMinutes).toBe(30);
  });
});

describe("selectDashboard activityByWeek", () => {
  it("buckets sessions into the trailing weeks and groups gaps as null", () => {
    const state = createSeedState();
    state.sessions = [
      session("a", "2026-10-20", 40), // week-1 start lands in week 1
      session("b", "2026-10-19", 10), // before the roadmap → null bucket
    ];

    const model = selectDashboard(roadmap, state, TODAY);

    expect(model.activityByWeek).toEqual([
      {
        weekNumber: 1,
        minutes: 40,
        label: "2026-10-20 → 2026-10-26",
      },
      { weekNumber: null, minutes: 10, label: "" },
    ]);
  });

  it("lists trailing weeks and drops sessions older than the window", () => {
    const today = "2026-12-23"; // week 10 → window is weeks 3 … 10
    const state = createSeedState();
    state.sessions = [
      session("w4", "2026-11-12", 25), // week 4
      session("w1", "2026-10-22", 15), // week 1: older than the window
      session("w10", "2026-12-23", 5), // week 10
      session("after", "2027-07-06", 60), // after roadmap end → null bucket
    ];

    const model = selectDashboard(roadmap, state, today);

    expect(model.activityByWeek).toEqual([
      {
        weekNumber: 4,
        minutes: 25,
        label: "2026-11-10 → 2026-11-16",
      },
      {
        weekNumber: 10,
        minutes: 5,
        label: "2026-12-22 → 2026-12-28",
      },
      { weekNumber: null, minutes: 60, label: "" },
    ]);
  });

  it("uses override-shifted weeks for buckets and the current week", () => {
    const state = createSeedState();
    state.weekDateOverrides = { "1": "2026-10-08" };
    state.sessions = [
      session("x", "2026-10-13", 20),
      session("y", TODAY, 45),
      session("z", "2026-10-28", 30),
    ];

    const model = selectDashboard(roadmap, state, TODAY);

    expect(model.activityByWeek).toEqual([
      {
        weekNumber: 1,
        minutes: 20,
        label: "2026-10-08 → 2026-10-14",
      },
      {
        weekNumber: 2,
        minutes: 30,
        label: "2026-10-27 → 2026-11-02",
      },
      { weekNumber: null, minutes: 45, label: "" },
    ]);
  });
});

describe("selectDashboard milestones", () => {
  it("lists the next three not-done deliverables by week end", () => {
    const state = createSeedState();
    const model = selectDashboard(roadmap, state, TODAY);

    expect(model.milestones).toHaveLength(3);
    const ends = model.milestones.map((m) => m.weekEnd);
    expect([...ends].sort()).toEqual(ends);
    for (const milestone of model.milestones) {
      expect(milestone.task.kind).toBe("deliverable");
      expect(milestone.task.weekNumber).toBe(milestone.week.number);
      expect(milestone.weekEnd).toBe(
        effectiveWeekRange(
          milestone.week.number,
          state.settings,
          state.weekDateOverrides,
        ).end,
      );
    }

    const earliestEnd = allWeeks
      .filter((week) =>
        week.tasks.some((task) => task.kind === "deliverable"),
      )
      .map(
        (week) =>
          effectiveWeekRange(
            week.number,
            state.settings,
            state.weekDateOverrides,
          ).end,
      )
      .sort()[0];
    expect(ends[0]).toBe(earliestEnd);
  });

  it("drops completed and skipped deliverables", () => {
    const state = createSeedState();
    const first = selectDashboard(roadmap, state, TODAY).milestones[0];
    state.taskStatus[first.task.id] = "done";

    const afterDone = selectDashboard(roadmap, state, TODAY);
    expect(afterDone.milestones.map((m) => m.task.id)).not.toContain(
      first.task.id,
    );

    const nextUp = afterDone.milestones[0];
    state.taskStatus[nextUp.task.id] = "skipped";
    const afterSkipped = selectDashboard(roadmap, state, TODAY);
    expect(afterSkipped.milestones.map((m) => m.task.id)).not.toContain(
      nextUp.task.id,
    );
    expect(afterSkipped.milestones).toHaveLength(3);
  });
});

describe("selectDashboard overdue", () => {
  it("matches overdueTasks exactly and ignores done/skipped work", () => {
    const today = "2026-11-15";
    const state = createSeedState();
    state.taskStatus[allWeeks[0].tasks[0].id] = "done";
    state.taskStatus[allWeeks[1].tasks[0].id] = "skipped";
    state.taskStatus[allWeeks[0].tasks[1].id] = "in_progress";

    const model = selectDashboard(roadmap, state, today);
    const expected = overdueTasks(
      roadmap,
      state.taskStatus,
      state.settings,
      state.weekDateOverrides,
      today,
    );

    expect(model.overdue).toEqual(expected);
    expect(model.overdue.length).toBeGreaterThan(0);
    for (const entry of model.overdue) {
      const range = effectiveWeekRange(
        entry.weekNumber,
        state.settings,
        state.weekDateOverrides,
      );
      expect(range.end < today).toBe(true);
      expect(state.taskStatus[entry.task.id] ?? "todo").not.toBe("done");
      expect(state.taskStatus[entry.task.id] ?? "todo").not.toBe("skipped");
    }
  });
});

describe("selectDashboard blocked", () => {
  it("lists blocked tasks with their week blocker note", () => {
    const state = createSeedState();
    state.weekBlockers["2"] = "في انتظار ترخيص الخادم";
    state.weekBlockers["4"] = "ملاحظة أسبوع بلا مهام متعثرة";
    state.taskStatus[allWeeks[1].tasks[0].id] = "blocked";
    state.taskStatus[allWeeks[2].tasks[0].id] = "blocked";
    state.taskStatus[allWeeks[1].tasks[1].id] = "done";

    const model = selectDashboard(roadmap, state, TODAY);

    expect(model.blocked).toEqual([
      {
        task: allWeeks[1].tasks[0],
        weekNumber: 2,
        note: "في انتظار ترخيص الخادم",
      },
      { task: allWeeks[2].tasks[0], weekNumber: 3 },
    ]);
  });
});

describe("selectDashboard issues", () => {
  it("is empty for the fresh roadmap and flags sessions outside the period", () => {
    const state = createSeedState();
    expect(selectDashboard(roadmap, state, TODAY).issues).toEqual([]);

    state.sessions = [session("outside", "2027-08-01", 30)];
    const model = selectDashboard(roadmap, state, TODAY);
    expect(model.issues).toContainEqual({
      severity: "warning",
      scope: "session",
      ref: "outside",
      messageKey: "session_outside_period",
      params: { date: "2027-08-01" },
    });
  });
});
