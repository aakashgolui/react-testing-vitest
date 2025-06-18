import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductForm from "../../src/components/ProductForm";
import { Category, Product } from "../../src/entities";
import AllProviders from "../AllProviders";
import { db } from "../mocks/db";

describe("ProductForm", () => {
  const categories: Category[] = [];

  beforeAll(() => {
    [1, 2, 3].forEach((item) => {
      const category = db.category.create({ name: "Category " + item });
      categories.push(category);
    });
  });

  afterAll(() => {
    db.category.deleteMany({
      where: { id: { in: categories.map((cat) => cat.id) } },
    });
  });

  it("should render form fields", async () => {
    const {
      getFieldsByPlaceholder,
      waitForLoader,
      getOption,
      user,
      getCategoriesCombobox,
    } = renderComponent();
    await waitForLoader();

    expect(getFieldsByPlaceholder(/name/i)).toBeInTheDocument();
    expect(getFieldsByPlaceholder(/price/i)).toBeInTheDocument();

    const comboBox = getCategoriesCombobox();

    expect(comboBox).toBeInTheDocument();

    await user.click(comboBox!);

    categories.forEach((cat) => {
      expect(getOption(cat.name)).toBeInTheDocument();
    });
  });

  it("should load with initial data on edition a product", async () => {
    const product = db.product.create({ categoryId: categories[0].id });
    const { waitForLoader, getFieldsByPlaceholder, getCategoriesCombobox } =
      renderComponent(product);
    await waitForLoader();

    expect(getFieldsByPlaceholder(/name/i)).toHaveValue(product.name);
    expect(getFieldsByPlaceholder(/price/i)).toHaveValue(
      product.price.toString()
    );

    expect(getCategoriesCombobox()).toHaveTextContent(categories[0].name);
  });

  const renderComponent = (product?: Product | undefined) => {
    render(<ProductForm product={product} onSubmit={vi.fn()} />, {
      wrapper: AllProviders,
    });
    return {
      user: userEvent.setup(),
      waitForLoader: async () =>
        await waitForElementToBeRemoved(() => screen.getByText(/loading/i)),
      getFieldsByPlaceholder: (placeholder: RegExp) =>
        screen.getByPlaceholderText(placeholder),
      getOption: (name: RegExp | string) =>
        screen.getByRole("option", { name }),
      getCategoriesCombobox: () =>
        screen.getByRole("combobox", {
          name: /category/i,
        }),
    };
  };
});
