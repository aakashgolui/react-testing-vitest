import { render, screen } from "@testing-library/react";
import AuthStatus from "../../src/components/AuthStatus";
import { mockAuthState } from "../utils";

describe("AuthStatus", () => {
  const renderComponent = () => {
    render(<AuthStatus />);
    return {
      getLogInButton: () => screen.queryByRole("button", { name: /log in/i }),
      getLogOutButton: () => screen.queryByRole("button", { name: /log out/i }),
    };
  };
  it("should show loading text while fetching state", () => {
    mockAuthState({
      isAuthenticated: false,
      isLoading: true,
      user: undefined,
    });
    renderComponent();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should render the login button if the user is unauthenticated", () => {
    mockAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
    });
    const { getLogInButton } = renderComponent();

    expect(getLogInButton()).toBeInTheDocument();
  });

  it("should render the logout button with username if user is authenticated", () => {
    mockAuthState({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 1,
        name: "Akash Golui",
        isAdmin: false,
      },
    });
    const { getLogInButton, getLogOutButton } = renderComponent();

    expect(screen.getByText(/Akash/i)).toBeInTheDocument();
    expect(getLogOutButton()).toBeInTheDocument();
    expect(getLogInButton()).not.toBeInTheDocument();
  });
});
