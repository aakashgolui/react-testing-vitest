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

  it.each([
    { scenario: "missing", errorMessage: /required/i },
    {
      scenario: "longer than 255 characters",
      name: "a".repeat(256),
      errorMessage: /255 character/i,
    },
  ])(
    "should display error if name is $scenario",
    async ({ errorMessage, name }) => {
      const { waitForFormToLoad, user } = renderComponent();
      const form = await waitForFormToLoad();
      if (name !== undefined) {
        await user.type(form.nameInput, name);
      }
      await user.type(form.priceInput, "10");
      await user.click(form.categoryInput);
      const options = screen.getAllByRole("option");
      await user.click(options[0]);
      await user.click(form.submitButton);

      const error = screen.getByRole("alert");

      expect(error).toBeInTheDocument();
      expect(error).toHaveTextContent(errorMessage);
    }
  );

  it.each([
    { scenario: "missing", errorMessage: /required/i },
    {
      scenario: "negative",
      price: -1,
      errorMessage: /greater than or equal to 1/i,
    },
    {
      scenario: "greater than 1000",
      price: 1001,
      errorMessage: /less than or equal to 1000/i,
    },
  ])(
    "should display error if price is $scenario",
    async ({ errorMessage, price }) => {
      const { waitForFormToLoad, user } = renderComponent();
      const form = await waitForFormToLoad();

      await user.type(form.nameInput, "Books");
      if (price !== undefined) {
        await user.type(form.priceInput, price.toString());
      }
      await user.click(form.categoryInput);
      const options = screen.getAllByRole("option");
      await user.click(options[0]);
      await user.click(form.submitButton);

      const error = screen.getByRole("alert");

      expect(error).toBeInTheDocument();
      expect(error).toHaveTextContent(errorMessage);
    }
  );

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
          submitButton: screen.getByRole("button"),
        };
      },
      getOption: (name: RegExp | string) =>
        screen.getByRole("option", { name }),
    };
  };
});
