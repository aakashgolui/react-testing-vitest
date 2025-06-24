import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import CategoryList from "../../src/components/CategoryList";
import { Category } from "../../src/entities";
import AllProviders from "../AllProviders";
import { db } from "../mocks/db";
import { simulateDelay, simulateError } from "../utils";

describe("CategoryList", () => {
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

  const renderComponent = () => {
    render(<CategoryList />, { wrapper: AllProviders });

    const waitForLoaderToBeRemoved = async () => {
      await waitForElementToBeRemoved(() => screen.getByText(/loading/i));
    };

    return {
      waitForLoaderToBeRemoved,
    };
  };

  it("should show loading while categories are getting fetched", async () => {
    simulateDelay("/categories");

    renderComponent();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should render the list of categories", async () => {
    const { waitForLoaderToBeRemoved } = renderComponent();

    await waitForLoaderToBeRemoved();

    const categoryList = await screen.findAllByRole("listitem");
    categoryList.forEach((category, i) => {
      expect(category).toHaveTextContent(categories[i].name);
    });
  });

  it("should give an error if API fetch fails", async () => {
    simulateError("/categories");
    const { waitForLoaderToBeRemoved } = renderComponent();

    await waitForLoaderToBeRemoved();

    expect(screen.getByText(/Error/i)).toBeInTheDocument();
  });
});
