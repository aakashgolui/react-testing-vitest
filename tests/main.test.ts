import { db } from "./mocks/db";

describe("group", () => {
  it("should", () => {
    const product = db.product.create({ name: "Apple" });
    console.log(db.product.getAll());
  });
});
