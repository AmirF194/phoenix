/**
 * A row the create mutation has just inserted into the connection carries no
 * `traceProject`, and it renders once before the range refetch replaces it.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  EvaluatorRowAverageCost,
  EvaluatorRowCost,
} from "@phoenix/pages/project/evaluators/ProjectEvaluatorsTable";

type CostRow = Parameters<typeof EvaluatorRowCost>[0]["row"];

const rowWithoutTraceProject = {
  evaluator: { kind: "LLM" },
} as unknown as CostRow;

describe("the evaluator cost cells", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("show the empty state for a row whose costs have not arrived yet", async () => {
    await act(async () => {
      root.render(
        <>
          <EvaluatorRowCost row={rowWithoutTraceProject} />
          <EvaluatorRowAverageCost row={rowWithoutTraceProject} />
        </>
      );
    });

    const costs = Array.from(
      container.querySelectorAll(".token-costs-item")
    ).map((node) => node.textContent);
    expect(costs).toEqual(["--", "--"]);
  });
});
