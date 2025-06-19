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
    const { waitForFormToLoad, getOption, user } = renderComponent();
    const { categoryInput, nameInput, priceInput } = await waitForFormToLoad();

    expect(nameInput).toBeInTheDocument();
    expect(priceInput).toBeInTheDocument();

    expect(categoryInput).toBeInTheDocument();

    await user.click(categoryInput!);

    categories.forEach((cat) => {
      expect(getOption(cat.name)).toBeInTheDocument();
    });
  });

  it("should load with initial data on edition a product", async () => {
    const product = db.product.create({ categoryId: categories[0].id });
    const { waitForFormToLoad } = renderComponent(product);
    const { categoryInput, nameInput, priceInput } = await waitForFormToLoad();

    expect(nameInput).toHaveValue(product.name);
    expect(priceInput).toHaveValue(product.price.toString());

    expect(categoryInput).toHaveTextContent(categories[0].name);
  });

  it("should put focus on the name field", async () => {
    const { waitForFormToLoad } = renderComponent();
    const { nameInput } = await waitForFormToLoad();

    expect(nameInput).toHaveFocus();
  });

  const renderComponent = (product?: Product | undefined) => {
    render(<ProductForm product={product} onSubmit={vi.fn()} />, {
      wrapper: AllProviders,
    });

    return {
      user: userEvent.setup(),
      waitForFormToLoad: async () => {
        await waitForElementToBeRemoved(() => screen.getByText(/loading/i));

        return {
          nameInput: screen.getByPlaceholderText(/name/i),
          priceInput: screen.getByPlaceholderText(/price/i),
          categoryInput: screen.getByRole("combobox", {
            name: /category/i,
          }),
        };
      },
      getOption: (name: RegExp | string) =>
        screen.getByRole("option", { name }),
    };
  };
});
