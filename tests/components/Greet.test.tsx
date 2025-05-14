import { render, screen } from "@testing-library/react";

import Greet from "../../src/components/Greet";

describe("Greet", () => {
  it("should render Hello with the name when name is provided", () => {
    render(<Greet name="Akash" />);

    const heading = screen.getByRole("heading");
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/akash/i);
  });

  it("should render login button if name is not provided", () => {
    render(<Greet />);

    const loginButton = screen.getByRole("button");
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toHaveTextContent(/login/i);
  });
});
