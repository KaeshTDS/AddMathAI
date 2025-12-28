
import { AppState, User, MathProblem, Feedback } from '../types';

const STORAGE_KEY = 'addmathai_data';

export const getAppState = (): AppState => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return {
      currentUser: null,
      problems: [],
      feedbacks: [],
    };
  }
  return JSON.parse(data);
};

export const saveAppState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const clearAuth = () => {
  const state = getAppState();
  state.currentUser = null;
  saveAppState(state);
};

export const addProblem = (problem: MathProblem) => {
  const state = getAppState();
  state.problems.unshift(problem);
  saveAppState(state);
};

export const addFeedback = (feedback: Feedback) => {
  const state = getAppState();
  state.feedbacks.unshift(feedback);
  saveAppState(state);
};
