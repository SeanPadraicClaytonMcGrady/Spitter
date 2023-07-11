import { describe } from "node:test";
import { prisma } from "~/server/db";

import { Like } from "@prisma/client";
import assert from "assert";
import { fetchTrainingData } from "~/server/api/routers/spit";

describe("fetchTrainingData", function () {
  it("should fetch training data for a given account ID", async function () {
    const accountId = "useYourOwnOrCheckENV";

    const result = await fetchTrainingData(accountId);

    assert.ok(result.length > 2);
  });
});
