import { screen } from "@testing-library/react";
import { db } from "./mocks/db";
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

  it("should render the product details page for the /products/:id", async () => {
    const product = db.product.create();
    navigateTo("/products/" + product.id);

    expect(
      await screen.findByRole("heading", { name: product.name })
    ).toBeInTheDocument();

    db.product.delete({ where: { id: { equals: product.id } } });
  });

  it("should through error on 404 page", () => {
    navigateTo("/invalid-route");

    expect(
      screen.queryByRole("heading", { name: /oops/i })
    ).toBeInTheDocument();
  });

  it("should render the admin homepage for /admin", async () => {
    navigateTo("/admin");

    expect(
      await screen.findByRole("heading", { name: /admin/i })
    ).toBeInTheDocument();
  });

  it("should render the admin products page for /admin/products", async () => {
    navigateTo("/admin/products");

    expect(
      await screen.findByRole("heading", { name: /products/i })
    ).toBeInTheDocument();
  });

  it("should render the admin products create page for /admin/products/new", async () => {
    navigateTo("/admin/products/new");

    expect(
      await screen.findByRole("heading", { name: /New product/i })
    ).toBeInTheDocument();
  });

  it("should render the admin products edit page for /admin/products/:id/edit", async () => {
    const product = db.product.create();
    navigateTo(`/admin/products/${product.id}/edit`);

    expect(
      await screen.findByRole("heading", { name: /edit product/i })
    ).toBeInTheDocument();
    db.product.delete({ where: { id: { equals: product.id } } });
  });
});
