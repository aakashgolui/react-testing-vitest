import { render, screen } from "@testing-library/react";
import ProductDetail from "../../src/components/ProductDetail";
import { products } from "../mocks/data";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";

describe("ProductDetail", () => {
  it("should render the list of products", async () => {
    render(<ProductDetail productId={1} />);

    expect(
      await screen.findByText(new RegExp(products[0].name))
    ).toBeInTheDocument();

    expect(
      await screen.findByText(new RegExp(products[0].price.toString()))
    ).toBeInTheDocument();
  });

  it("should should render message if product is not found", async () => {
    server.use(http.get("/products/1", () => HttpResponse.json(null)));

    render(<ProductDetail productId={1} />);

    const text = await screen.findByText(/product was not found/i);
    expect(text).toBeInTheDocument();
  });

  it("should render error for invalid productID", async () => {
    render(<ProductDetail productId={0} />);

    const text = await screen.findByText(/invalid/i);
    expect(text).toBeInTheDocument();
  });
});
