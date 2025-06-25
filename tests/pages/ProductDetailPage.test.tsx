import { screen } from "@testing-library/react";
import { Product } from "../../src/entities";
import { db } from "../mocks/db";
import { navigateTo, simulateDelay } from "../utils";

describe("ProductDetailPage", () => {
  let product: Product;
  beforeAll(() => {
    product = db.product.create();
  });

  afterAll(() => {
    db.product.delete({ where: { id: { equals: product.id } } });
  });

  it("should show loading while product details are fetching", async () => {
    const path = "/products/" + product.id;
    simulateDelay(path);

    navigateTo(path);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should render product not found upon redirecting to wrong id", async () => {
    const path = "/products/" + 111;

    navigateTo(path);

    expect(await screen.findByText(/not found/i)).toBeInTheDocument();
  });

  it("should render product details", async () => {
    const path = "/products/" + product.id;

    navigateTo(path);

    expect(
      await screen.findByRole("heading", { name: product.name })
    ).toBeInTheDocument();
  });
});
