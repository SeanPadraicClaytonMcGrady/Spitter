import { describe } from "node:test";
import { fetchTrainingData } from "~/server/api/routers/spit";

describe("fetchTrainingData", () => {
  it("should fetch training data for a given account ID", async () => {
    const accountId = "252445454090895360";

    const spits = await fetchTrainingData(accountId);

    expect(spits).toBeGreaterThan(2);
  });
});
