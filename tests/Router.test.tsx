import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import routes from "../src/routes";

describe("Router", () => {
  it("should render the home for the root route", () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ["/"],
    });
    render(<RouterProvider router={router}></RouterProvider>);

    expect(
      screen.getByRole("heading", { name: /home page/i })
    ).toBeInTheDocument();
  });

  it("should render the products for the /products", () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ["/products"],
    });
    render(<RouterProvider router={router}></RouterProvider>);

    expect(
      screen.getByRole("heading", { name: /products/i })
    ).toBeInTheDocument();
  });
});
