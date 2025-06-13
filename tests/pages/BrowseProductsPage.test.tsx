import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import BrowseProducts from "../../src/pages/BrowseProductsPage";
import { server } from "../mocks/server";
import { delay, http, HttpResponse } from "msw";
import userEvent from "@testing-library/user-event";
import { db } from "../mocks/db";
import { Category, Product } from "../../src/entities";
import { CartProvider } from "../../src/providers/CartProvider";
import { Theme } from "@radix-ui/themes";

describe("BrowseProducts", () => {
  const renderComponent = () => {
    render(
      <CartProvider>
        <Theme>
          <BrowseProducts />
        </Theme>
      </CartProvider>
    );
  };

  const categories: Category[] = [];
  const products: Product[] = [];

  beforeAll(() => {
    [1, 2, 3].forEach((item) => {
      const category = db.category.create({ name: "Category " + item });
      categories.push(category);
      [1, 2, 3].forEach(() => {
        products.push(db.product.create({ categoryId: category.id }));
      });
    });
  });

  afterAll(() => {
    db.category.deleteMany({
      where: { id: { in: categories.map((cat) => cat.id) } },
    });
    db.product.deleteMany({
      where: { id: { in: products.map((product) => product.id) } },
    });
  });

  it("should render loading indicator when fetching categories", () => {
    server.use(
      http.get("/categories", async () => {
        await delay();
        return HttpResponse.json([]);
      })
    );
    renderComponent();

    const skeleton = screen.getByRole("progressbar", { name: /categories/i });
    expect(skeleton).toBeInTheDocument();
  });

  it("should remove the loading indicator when categories are fetched", async () => {
    renderComponent();
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
    renderComponent();

    const skeleton = screen.getByRole("progressbar", { name: /products/i });
    expect(skeleton).toBeInTheDocument();
  });

  it("should remove the loading indicator when products are fetched", async () => {
    renderComponent();
    await waitForElementToBeRemoved(() =>
      screen.getByRole("progressbar", { name: /products/i })
    );
  });

  it("should not show an error if categories fetch fails", async () => {
    server.use(http.get("/categories", () => HttpResponse.error()));
    renderComponent();

    await waitForElementToBeRemoved(() =>
      screen.getByRole("progressbar", { name: /categories/i })
    );

    const text = screen.queryByText(/error/i);
    expect(text).not.toBeInTheDocument();

    const categories = screen.queryByRole("combobox");
    expect(categories).not.toBeInTheDocument();
  });

  it("should show an error if products fetch fails", async () => {
    server.use(http.get("/products", () => HttpResponse.error()));
    renderComponent();

    const text = await screen.findByText(/error/i);
    expect(text).toBeInTheDocument();
  });

  it("should render categories", async () => {
    renderComponent();

    const combobox = await screen.findByRole("combobox");
    expect(combobox).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(combobox);

    const option = screen.getByRole("option", { name: /all/i });
    expect(option).toBeInTheDocument();

    categories.forEach((cat) => {
      expect(
        screen.getByRole("option", { name: cat.name })
      ).toBeInTheDocument();
    });
  });

  it("should render products", async () => {
    renderComponent();

    await waitForElementToBeRemoved(() =>
      screen.queryByRole("progressbar", { name: /products/i })
    );
    products.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
    });
  });
});
