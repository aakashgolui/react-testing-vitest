import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuantitySelector from "../../src/components/QuantitySelector";
import AllProviders from "../AllProviders";
import { db } from "../mocks/db";

describe("QuantitySelector", () => {
  const renderComponent = () => {
    const product = db.product.create();
    const user = userEvent.setup();
    render(<QuantitySelector product={product} />, { wrapper: AllProviders });

    const getAddToCartButton = () =>
      screen.getByRole("button", { name: /add to cart/i });

    const getQuantityControls = () => ({
      incrementButton: screen.queryByRole("button", { name: "+" }),
      decrementButton: screen.queryByRole("button", { name: "-" }),
      quantity: screen.queryByRole("status"),
    });

    const clickCartButton = async () => {
      const cartButton = getAddToCartButton();
      await user.click(cartButton);
    };

    const clickIncrementButton = async () => {
      const incrementButton = getQuantityControls().incrementButton;
      await user.click(incrementButton!);
    };

    const clickDecrementButton = async () => {
      const decrementButton = getQuantityControls().decrementButton;
      await user.click(decrementButton!);
    };

    return {
      getAddToCartButton,
      getQuantityControls,
      clickCartButton,
      clickIncrementButton,
      clickDecrementButton,
    };
  };

  it("should have Add to Cart button if cart is empty", () => {
    const { getAddToCartButton } = renderComponent();

    expect(getAddToCartButton()).toBeInTheDocument();
  });

  it("should add product to the cart", async () => {
    const { getAddToCartButton, getQuantityControls, clickCartButton } =
      renderComponent();
    const cartButton = getAddToCartButton();
    await clickCartButton();

    const { decrementButton, incrementButton, quantity } =
      getQuantityControls();

    expect(quantity).toHaveTextContent("1");
    expect(incrementButton).toBeInTheDocument();
    expect(decrementButton).toBeInTheDocument();
    expect(cartButton).not.toBeInTheDocument();
  });

  it("should increment the quantity", async () => {
    const { getQuantityControls, clickCartButton, clickIncrementButton } =
      renderComponent();
    await clickCartButton();

    await clickIncrementButton();

    const { quantity } = getQuantityControls();
    expect(quantity).toHaveTextContent("2");
  });

  it("should decrement the quantity", async () => {
    const {
      getQuantityControls,
      clickCartButton,
      clickIncrementButton,
      clickDecrementButton,
    } = renderComponent();
    await clickCartButton();

    await clickIncrementButton();
    await clickDecrementButton();

    const { quantity } = getQuantityControls();
    expect(quantity).toHaveTextContent("1");
  });
  it("should remove the product from the cart", async () => {
    const {
      getAddToCartButton,
      clickDecrementButton,
      getQuantityControls,
      clickCartButton,
    } = renderComponent();
    await clickCartButton();

    await clickDecrementButton();

    const { quantity } = getQuantityControls();
    expect(quantity).not.toBeInTheDocument();
    expect(getAddToCartButton()).toBeInTheDocument();
  });
});
