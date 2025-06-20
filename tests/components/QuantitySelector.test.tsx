import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuantitySelector from "../../src/components/QuantitySelector";
import AllProviders from "../AllProviders";
import { db } from "../mocks/db";

describe("QuantitySelector", () => {
  const renderComponent = () => {
    const product = db.product.create();
    render(<QuantitySelector product={product} />, { wrapper: AllProviders });

    return {
      user: userEvent.setup(),
      getAddToCartButton: () =>
        screen.getByRole("button", { name: /add to cart/i }),
      getQuantityControls: () => ({
        incrementButton: screen.queryByRole("button", { name: "+" }),
        decrementButton: screen.queryByRole("button", { name: "-" }),
        quantity: screen.queryByRole("status"),
      }),
    };
  };

  it("should have Add to Cart button if cart is empty", () => {
    const { getAddToCartButton } = renderComponent();

    expect(getAddToCartButton()).toBeInTheDocument();
  });

  it("should add product to the cart", async () => {
    const { getAddToCartButton, user, getQuantityControls } = renderComponent();

    const cartButton = getAddToCartButton();
    await user.click(cartButton);

    const { decrementButton, incrementButton, quantity } =
      getQuantityControls();

    expect(quantity).toHaveTextContent("1");
    expect(incrementButton).toBeInTheDocument();
    expect(decrementButton).toBeInTheDocument();
    expect(cartButton).not.toBeInTheDocument();
  });

  it("should increment the quantity", async () => {
    const { getAddToCartButton, user, getQuantityControls } = renderComponent();
    await user.click(getAddToCartButton());

    const { incrementButton, quantity } = getQuantityControls();
    await user.click(incrementButton!);

    expect(quantity).toHaveTextContent("2");
  });

  it("should decrement the quantity", async () => {
    const { getAddToCartButton, user, getQuantityControls } = renderComponent();
    await user.click(getAddToCartButton());

    const { incrementButton, decrementButton, quantity } =
      getQuantityControls();
    await user.click(incrementButton!);
    await user.click(decrementButton!);

    expect(quantity).toHaveTextContent("1");
  });
  it("should remove the product from the cart", async () => {
    const { getAddToCartButton, user, getQuantityControls } = renderComponent();
    await user.click(getAddToCartButton());

    const { decrementButton, quantity } = getQuantityControls();
    await user.click(decrementButton!);

    expect(quantity).not.toBeInTheDocument();
    expect(getAddToCartButton()).toBeInTheDocument();
  });
});
