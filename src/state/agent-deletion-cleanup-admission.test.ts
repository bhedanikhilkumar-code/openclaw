import { describe, expect, it, vi } from "vitest";
import { finishAdmissionWhenSettled } from "./agent-deletion-cleanup-admission.js";

describe("finishAdmissionWhenSettled", () => {
  it.each(["fulfilled", "rejected"] as const)(
    "finishes the admission when settlement is %s",
    async (outcome) => {
      let resolve!: () => void;
      let reject!: (error: Error) => void;
      const settled = new Promise<void>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      const finish = vi.fn();

      finishAdmissionWhenSettled(settled, finish);
      if (outcome === "fulfilled") {
        resolve();
      } else {
        reject(new Error("worker settlement failed"));
      }

      await settled.catch(() => undefined);
      await Promise.resolve();

      expect(finish).toHaveBeenCalledTimes(1);
    },
  );
});
