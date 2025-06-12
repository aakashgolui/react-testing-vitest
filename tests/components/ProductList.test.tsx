import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import ProductList from "../../src/components/ProductList";
import { server } from "../mocks/server";
import { http, HttpResponse, delay } from "msw";
import { db } from "../mocks/db";

describe("ProductList", () => {
  const productIds: number[] = [];

  beforeAll(() => {
    [1, 2, 3].forEach(() => {
      const product = db.product.create();
      productIds.push(product.id);
    });
  });

  afterAll(() => {
    db.product.deleteMany({ where: { id: { in: productIds } } });
  });

  it("should render the list of products", async () => {
    render(<ProductList />);

    const items = await screen.findAllByRole("listitem");
    expect(items.length).toBeGreaterThan(0);
  });

  it("should render No products available if no products available", async () => {
    server.use(http.get("/products", () => HttpResponse.json([])));

    render(<ProductList />);

    const text = await screen.findAllByText(/no products/i);
    expect(text[0]).toBeInTheDocument();
  });

  it("should render an error message when there is an error", async () => {
    server.use(http.get("/products", () => HttpResponse.error()));

    render(<ProductList />);

    const text = await screen.findByText(/error/i);
    expect(text).toBeInTheDocument();
  });

  it("should show loading if when the API is getting fetched", async () => {
    server.use(
      http.get("/products", async () => {
        await delay();
        return HttpResponse.json([]);
      })
    );

    render(<ProductList />);

    const text = await screen.findByText(/loading/i);
    expect(text).toBeInTheDocument();
  });

  it("should remove the loading indicator after the data is fetched", async () => {
    render(<ProductList />);

    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
  });

  it("should remove the loading indicator if data fetch fails", async () => {
    server.use(http.get("/products", () => HttpResponse.error()));

    render(<ProductList />);

    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
  });
});
