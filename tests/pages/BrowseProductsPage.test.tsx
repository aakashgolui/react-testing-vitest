import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import BrowseProducts from "../../src/pages/BrowseProductsPage";
import userEvent from "@testing-library/user-event";
import { db } from "../mocks/db";
import { Category, Product } from "../../src/entities";
import { CartProvider } from "../../src/providers/CartProvider";
import { Theme } from "@radix-ui/themes";
import { simulateDelay, simulateError } from "../utils";

describe("BrowseProducts", () => {
  const renderComponent = () => {
    render(
      <CartProvider>
        <Theme>
          <BrowseProducts />
        </Theme>
      </CartProvider>
    );
    return {
      getProductsSkeleton: () =>
        screen.queryByRole("progressbar", { name: /products/i }),
      getCategoriesSkeleton: () =>
        screen.getByRole("progressbar", { name: /categories/i }),
      getCategoriesComboBox: () => screen.queryByRole("combobox"),
      getErrorText: () => screen.queryByText(/error/i),
    };
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
    simulateDelay("/categories");
    const { getCategoriesSkeleton } = renderComponent();

    const skeleton = getCategoriesSkeleton();
    expect(skeleton).toBeInTheDocument();
  });

  it("should remove the loading indicator when categories are fetched", async () => {
    const { getCategoriesSkeleton } = renderComponent();
    await waitForElementToBeRemoved(getCategoriesSkeleton);
  });

  it("should render loading indicator when fetching products", () => {
    simulateDelay("/products");
    const { getProductsSkeleton } = renderComponent();

    const skeleton = getProductsSkeleton();
    expect(skeleton).toBeInTheDocument();
  });

  it("should remove the loading indicator when products are fetched", async () => {
    const { getProductsSkeleton } = renderComponent();
    await waitForElementToBeRemoved(getProductsSkeleton);
  });

  it("should not show an error if categories fetch fails", async () => {
    simulateError("/categories");
    const { getCategoriesSkeleton, getCategoriesComboBox, getErrorText } =
      renderComponent();

    await waitForElementToBeRemoved(getCategoriesSkeleton);

    expect(getErrorText()).not.toBeInTheDocument();

    expect(getCategoriesComboBox()).not.toBeInTheDocument();
  });

  it("should show an error if products fetch fails", async () => {
    simulateError("/products");
    const { getProductsSkeleton, getErrorText } = renderComponent();

    await waitForElementToBeRemoved(getProductsSkeleton);

    expect(getErrorText()).toBeInTheDocument();
  });

  it("should render categories", async () => {
    const { getCategoriesSkeleton, getCategoriesComboBox } = renderComponent();

    await waitForElementToBeRemoved(getCategoriesSkeleton);

    const combobox = getCategoriesComboBox();
    expect(getCategoriesComboBox()).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(combobox!);

    const option = screen.getByRole("option", { name: /all/i });
    expect(option).toBeInTheDocument();

    categories.forEach((cat) => {
      expect(
        screen.getByRole("option", { name: cat.name })
      ).toBeInTheDocument();
    });
  });

  it("should render products", async () => {
    const { getProductsSkeleton } = renderComponent();

    await waitForElementToBeRemoved(getProductsSkeleton);

    products.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
    });
  });
});
