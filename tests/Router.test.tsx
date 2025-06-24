import { screen } from "@testing-library/react";
import { navigateTo } from "./utils";

describe("Router", () => {
  it("should render the home for the root route", () => {
    navigateTo("/");

    expect(
      screen.getByRole("heading", { name: /home page/i })
    ).toBeInTheDocument();
  });

  it("should render the products for the /products", () => {
    navigateTo("/products");

    expect(
      screen.getByRole("heading", { name: /products/i })
    ).toBeInTheDocument();
  });
});
