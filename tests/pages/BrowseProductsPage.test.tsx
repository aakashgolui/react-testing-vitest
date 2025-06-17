import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Category, Product } from "../../src/entities";
import BrowseProducts from "../../src/pages/BrowseProductsPage";
import AllProviders from "../AllProviders";
import { db, getProductsByCategory } from "../mocks/db";
import { simulateDelay, simulateError } from "../utils";

describe("BrowseProducts", () => {
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

    expect(getCategoriesSkeleton()).toBeInTheDocument();
  });

  it("should remove the loading indicator when categories are fetched", async () => {
    const { getCategoriesSkeleton } = renderComponent();
    await waitForElementToBeRemoved(getCategoriesSkeleton);
  });

  it("should render loading indicator when fetching products", () => {
    simulateDelay("/products");
    const { getProductsSkeleton } = renderComponent();

    expect(getProductsSkeleton()).toBeInTheDocument();
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
    const { getCategoriesSkeleton, getCategoriesComboBox, user, getOption } =
      renderComponent();

    await waitForElementToBeRemoved(getCategoriesSkeleton);

    const combobox = getCategoriesComboBox();
    expect(combobox).toBeInTheDocument();

    await user.click(combobox!);

    expect(getOption(/all/i)).toBeInTheDocument();

    categories.forEach((cat) => {
      expect(getOption(cat.name)).toBeInTheDocument();
    });
  });

  it("should render products", async () => {
    const { getProductsSkeleton, getText } = renderComponent();

    await waitForElementToBeRemoved(getProductsSkeleton);

    products.forEach((product) => {
      expect(getText(product.name)).toBeInTheDocument();
    });
  });

  it("should filter products by category", async () => {
    const { selectCategory, expectProductsToBeInTheDocument } =
      renderComponent();
    const selectedCategory = categories[0];
    await selectCategory(selectedCategory.name);

    const products = getProductsByCategory(selectedCategory.id);

    expectProductsToBeInTheDocument(products);
  });

  it("should all products if 'All' category is selected", async () => {
    const { selectCategory, expectProductsToBeInTheDocument } =
      renderComponent();

    await selectCategory(/all/i);

    const products = db.product.getAll();

    expectProductsToBeInTheDocument(products);
  });

  const renderComponent = () => {
    render(<BrowseProducts />, { wrapper: AllProviders });

    const user = userEvent.setup();

    const getCategoriesComboBox = () => screen.queryByRole("combobox");

    const getCategoriesSkeleton = () =>
      screen.getByRole("progressbar", { name: /categories/i });

    const getOption = (name: RegExp | string) =>
      screen.getByRole("option", { name });
    const getText = (name: string) => screen.getByText(name);

    const expectProductsToBeInTheDocument = (products: Product[]) => {
      const getDataRows = screen.getAllByRole("row")?.slice(1);
      expect(getDataRows).toHaveLength(products.length);

      products.forEach((product) => {
        expect(getText(product.name)).toBeInTheDocument();
      });
    };

    const selectCategory = async (name: RegExp | string) => {
      await waitForElementToBeRemoved(getCategoriesSkeleton);
      const comboBox = getCategoriesComboBox();
      await user.click(comboBox!);

      const option = getOption(name);
      await user.click(option);
    };

    return {
      getProductsSkeleton: () =>
        screen.queryByRole("progressbar", { name: /products/i }),
      getCategoriesSkeleton,
      getCategoriesComboBox,
      getErrorText: () => screen.queryByText(/error/i),
      user,
      selectCategory,
      getText,
      getOption,
      expectProductsToBeInTheDocument,
    };
  };
});
