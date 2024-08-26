import { Watcher } from "./dependence-manager";
import { WithDependenceManager } from "./global";
import { getDependenceManagerFromOptions } from "./utils";

export const subscribe = (
  watcher: Watcher,
  options?: WithDependenceManager<{}>,
) => {
  const dependenceManager = getDependenceManagerFromOptions(options);

  dependenceManager.addWatcher(watcher);
  watcher();
  dependenceManager.clearWatchers();
};

const withPreviousValue = <R, T>(fn: (param?: T) => R) => {
  let previousValue: R | undefined = undefined;

  return (param?: T) => {
    const currentValue = fn(param);
    const parsedPreviousValue = previousValue ?? currentValue;

    previousValue = currentValue;

    return {
      previousValue: parsedPreviousValue,
      currentValue,
    };
  };
};

// Same as subscribe but it will call the reactFunction only if the return value of computedFunction has changed
export const stream = <R>(
  computedFunction: () => R,
  reactFunction: (params: R) => void,
  options?: WithDependenceManager<{}>,
) => {
  const dependenceManager = getDependenceManagerFromOptions(options);
  const computedFunctionWithPreviousValue = withPreviousValue(computedFunction);

  dependenceManager.addWatcher(() => {
    const { previousValue, currentValue } = computedFunctionWithPreviousValue();

    if (previousValue === currentValue) {
      return;
    }

    reactFunction(currentValue);
  });

  computedFunctionWithPreviousValue();

  dependenceManager.clearWatchers();
};
