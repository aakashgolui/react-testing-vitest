import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "react-hot-toast";
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
      const { waitForFormToLoad, expectErrorToBeInTheDocument } =
        renderComponent();
      const { fill, validData } = await waitForFormToLoad();

      await fill({
        ...validData,
        name,
      });

      expectErrorToBeInTheDocument(errorMessage);
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
    {
      scenario: "not a number",
      price: "a",
      errorMessage: /required/i,
    },
  ])(
    "should display error if price is $scenario",
    async ({ errorMessage, price }) => {
      const { waitForFormToLoad, expectErrorToBeInTheDocument } =
        renderComponent();
      const { fill, validData } = await waitForFormToLoad();

      await fill({
        ...validData,
        price,
      });

      expectErrorToBeInTheDocument(errorMessage);
    }
  );

  it("should submit form with correct data", async () => {
    const { waitForFormToLoad, onSubmit } = renderComponent();

    const { fill, validData } = await waitForFormToLoad();
    await fill(validData);
    const { id, ...formData } = validData;

    expect(onSubmit).toBeCalledWith(formData);
  });

  it("should display an error toast if submission fails", async () => {
    const { waitForFormToLoad, onSubmit } = renderComponent();
    onSubmit.mockRejectedValue("error");

    const { fill, validData } = await waitForFormToLoad();
    await fill(validData);

    const errorToast = await screen.findByRole("status");
    expect(errorToast).toBeInTheDocument();
    expect(errorToast).toHaveTextContent(/error/i);
  });

  it("should disable the submit button while submitting the form", async () => {
    const { waitForFormToLoad, onSubmit } = renderComponent();
    onSubmit.mockReturnValue(new Promise(() => {}));

    const { fill, validData, submitButton } = await waitForFormToLoad();
    await fill(validData);

    expect(submitButton).toBeDisabled();
  });

  it("should re-enable the submit button form submit", async () => {
    const { waitForFormToLoad, onSubmit } = renderComponent();
    onSubmit.mockResolvedValue({});

    const { fill, validData, submitButton } = await waitForFormToLoad();
    await fill(validData);

    expect(submitButton).not.toBeDisabled();
  });

  it("should not allow white space in name input", async () => {
    const { waitForFormToLoad, expectErrorToBeInTheDocument } =
      renderComponent();

    const { fill, validData } = await waitForFormToLoad();
    await fill({ ...validData, name: " " });

    expectErrorToBeInTheDocument(/required/i);
  });

  const renderComponent = (product?: Product | undefined) => {
    const onSubmit = vi.fn();
    render(
      <>
        <ProductForm product={product} onSubmit={onSubmit} />
        <Toaster />
      </>,
      {
        wrapper: AllProviders,
      }
    );

    const user = userEvent.setup();

    return {
      user,
      expectErrorToBeInTheDocument: (errorMessage: RegExp) => {
        const error = screen.getByRole("alert");

        expect(error).toBeInTheDocument();
        expect(error).toHaveTextContent(errorMessage);
      },
      waitForFormToLoad: async () => {
        await waitForElementToBeRemoved(() => screen.getByText(/loading/i));

        const nameInput = screen.getByPlaceholderText(/name/i);

        const priceInput = screen.getByPlaceholderText(/price/i);

        const categoryInput = screen.getByRole("combobox", {
          name: /category/i,
        });

        const submitButton = screen.getByRole("button");
        type FormData = {
          [K in keyof Product]: any;
        };
        const validData: FormData = {
          id: 1,
          name: "q",
          price: 10,
          categoryId: categories[0].id,
        };
        const fill = async (fromData: FormData) => {
          if (fromData.name !== undefined) {
            await user.type(nameInput, fromData.name);
          }

          if (fromData.price !== undefined) {
            await user.type(priceInput, fromData.price.toString());
          }

          await user.tab();
          await user.click(categoryInput);
          const options = screen.getAllByRole("option");
          await user.click(options[0]);
          await user.click(submitButton);
        };
        return {
          nameInput,
          priceInput,
          categoryInput,
          submitButton,
          fill,
          validData,
        };
      },
      onSubmit,
      getOption: (name: RegExp | string) =>
        screen.getByRole("option", { name }),
    };
  };
});
