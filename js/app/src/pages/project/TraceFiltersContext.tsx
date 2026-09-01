import type { PropsWithChildren } from "react";
import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSearchParams } from "react-router";

import { TRACE_FILTER_CONDITION_PARAM } from "@phoenix/constants/searchParams";
import { joinFilterConditions } from "@phoenix/utils/filterConditionUtils";

export type TraceFiltersContextType = {
  filterCondition: string;
  setFilterCondition: (condition: string) => void;
  appendFilterCondition: (condition: string) => void;
};

export const TraceFiltersContext =
  createContext<TraceFiltersContextType | null>(null);

export function useTraceFilters() {
  const context = useContext(TraceFiltersContext);
  if (context === null) {
    throw new Error(
      "useTraceFilters must be used within a TraceFiltersProvider"
    );
  }
  return context;
}

export function TraceFiltersProvider(props: PropsWithChildren) {
  // Writes back to the URL happen where the state is applied (TracesTable), so
  // only valid conditions are persisted. Whitespace-only text is normalized to
  // the empty condition so the editor and query agree.
  const [searchParams] = useSearchParams();
  const rawUrlCondition = searchParams.get(TRACE_FILTER_CONDITION_PARAM) ?? "";
  const urlCondition = rawUrlCondition.trim() === "" ? "" : rawUrlCondition;
  const [filterCondition, setFilterConditionState] =
    useState<string>(urlCondition);

  // Follow navigation that explicitly changes the filter while leaving
  // unrelated search-param updates alone. An applied filter's own URL write is
  // a no-op here because the draft already contains that same condition.
  useEffect(() => {
    startTransition(() => {
      setFilterConditionState(urlCondition);
    });
  }, [urlCondition]);

  function setFilterCondition(condition: string) {
    startTransition(() => {
      setFilterConditionState(condition);
    });
  }

  function appendFilterCondition(condition: string) {
    startTransition(() => {
      setFilterConditionState((currentCondition) =>
        joinFilterConditions({
          existingCondition: currentCondition,
          nextCondition: condition,
        })
      );
    });
  }

  return (
    <TraceFiltersContext.Provider
      value={{
        filterCondition,
        setFilterCondition,
        appendFilterCondition,
      }}
    >
      {props.children}
    </TraceFiltersContext.Provider>
  );
}
