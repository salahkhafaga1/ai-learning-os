import { createSeedState } from "@/data/seed";
import { WEEK_COUNT } from "@/domain/constants";
import type { AppState } from "@/domain/types";
import type { Action } from "./actions";

function isValidWeekNumber(weekNumber: number): boolean {
  return (
    Number.isInteger(weekNumber) &&
    weekNumber >= 1 &&
    weekNumber <= WEEK_COUNT
  );
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "data/load":
    case "data/import":
      return structuredClone(action.state);

    case "data/reset":
      return createSeedState();

    case "task/setStatus": {
      if (!(action.taskId in state.taskStatus)) {
        return state;
      }
      return {
        ...state,
        taskStatus: {
          ...state.taskStatus,
          [action.taskId]: action.status,
        },
      };
    }

    case "week/setNote": {
      if (!isValidWeekNumber(action.weekNumber)) {
        return state;
      }
      return {
        ...state,
        weekNotes: {
          ...state.weekNotes,
          [String(action.weekNumber)]: action.text,
        },
      };
    }

    case "week/setBlocker": {
      if (!isValidWeekNumber(action.weekNumber)) {
        return state;
      }
      return {
        ...state,
        weekBlockers: {
          ...state.weekBlockers,
          [String(action.weekNumber)]: action.text,
        },
      };
    }

    case "week/setDateOverride": {
      if (!isValidWeekNumber(action.weekNumber)) {
        return state;
      }
      const key = String(action.weekNumber);
      const nextOverrides = { ...state.weekDateOverrides };
      if (action.startISO === null) {
        delete nextOverrides[key];
      } else {
        nextOverrides[key] = action.startISO;
      }
      return { ...state, weekDateOverrides: nextOverrides };
    }

    case "week/saveReview": {
      if (!isValidWeekNumber(action.weekNumber)) {
        return state;
      }
      return {
        ...state,
        reviews: {
          ...state.reviews,
          [String(action.weekNumber)]: action.review,
        },
      };
    }

    case "session/add":
      return { ...state, sessions: [...state.sessions, action.session] };

    case "session/update": {
      if (!state.sessions.some((session) => session.id === action.session.id)) {
        return state;
      }
      return {
        ...state,
        sessions: state.sessions.map((session) =>
          session.id === action.session.id ? action.session : session,
        ),
      };
    }

    case "session/delete": {
      if (!state.sessions.some((session) => session.id === action.id)) {
        return state;
      }
      return {
        ...state,
        sessions: state.sessions.filter((session) => session.id !== action.id),
      };
    }

    case "skill/setAssessment": {
      if (!(action.skillId in state.skillAssessments)) {
        return state;
      }
      const { level, evidence } = action.assessment;
      if (!Number.isInteger(level) || level < 0 || level > 5) {
        return state;
      }
      if (level === 5 && evidence.trim().length === 0) {
        return state;
      }
      return {
        ...state,
        skillAssessments: {
          ...state.skillAssessments,
          [action.skillId]: action.assessment,
        },
      };
    }

    case "project/add":
      return { ...state, projects: [...state.projects, action.project] };

    case "project/update": {
      if (!state.projects.some((project) => project.id === action.project.id)) {
        return state;
      }
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.project.id ? action.project : project,
        ),
      };
    }

    case "project/delete": {
      if (!state.projects.some((project) => project.id === action.projectId)) {
        return state;
      }
      return {
        ...state,
        projects: state.projects.filter(
          (project) => project.id !== action.projectId,
        ),
      };
    }

    case "resource/setState": {
      if (!(action.resourceId in state.resourceStatus)) {
        return state;
      }
      return {
        ...state,
        resourceStatus: {
          ...state.resourceStatus,
          [action.resourceId]: action.value,
        },
      };
    }

    case "settings/patch":
      return { ...state, settings: { ...state.settings, ...action.patch } };
  }
}
