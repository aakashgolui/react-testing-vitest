import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import BrowseProducts from "../../src/pages/BrowseProductsPage";
import { server } from "../mocks/server";
import { delay, http, HttpResponse } from "msw";
import AllProviders from "../AllProviders";

describe("BrowseProducts", () => {
  it("should render loading indicator when fetching categories", () => {
    server.use(
      http.get("/categories", async () => {
        await delay();
        return HttpResponse.json([]);
      })
    );
    render(<BrowseProducts />, { wrapper: AllProviders });

    const skeleton = screen.getByRole("progressbar", { name: /categories/i });
    expect(skeleton).toBeInTheDocument();
  });

  it("should remove the loading indicator when categories are fetched", async () => {
    render(<BrowseProducts />, { wrapper: AllProviders });
    await waitForElementToBeRemoved(() =>
      screen.getByRole("progressbar", { name: /categories/i })
    );
  });

  it("should render loading indicator when fetching products", () => {
    server.use(
      http.get("/products", async () => {
        await delay();
        return HttpResponse.json([]);
      })
    );
    render(<BrowseProducts />, { wrapper: AllProviders });

    const skeleton = screen.getByRole("progressbar", { name: /products/i });
    expect(skeleton).toBeInTheDocument();
  });

  it("should remove the loading indicator when products are fetched", async () => {
    render(<BrowseProducts />, { wrapper: AllProviders });
    await waitForElementToBeRemoved(() =>
      screen.getByRole("progressbar", { name: /products/i })
    );
  });

  it("should not show an error if categories fetch fails", async () => {
    server.use(http.get("/categories", () => HttpResponse.error()));
    render(<BrowseProducts />, { wrapper: AllProviders });

    await waitForElementToBeRemoved(() =>
      screen.getByRole("progressbar", { name: /categories/i })
    );

    const text = screen.queryByText(/error/i);
    expect(text).not.toBeInTheDocument();

    const categories = screen.queryByRole("combobox", { name: /categories/i });
    expect(categories).not.toBeInTheDocument();
  });

  it("should show an error if products fetch fails", async () => {
    server.use(http.get("/products", () => HttpResponse.error()));
    render(<BrowseProducts />, { wrapper: AllProviders });

    const text = await screen.findByText(/error/i);
    expect(text).toBeInTheDocument();
  });
});
