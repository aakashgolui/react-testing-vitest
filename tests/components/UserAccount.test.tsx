import { render, screen } from "@testing-library/react";
import UserAccount from "../../src/components/UserAccount";

describe("UserAccount", () => {
  it("should render username if username is provided", () => {
    render(<UserAccount user={{ id: 1, name: "Akash" }} />);

    const userName = screen.getByText(/akash/i);

    expect(userName).toBeInTheDocument();
  });

  it("should render edit button if isAdmin is true", () => {
    render(<UserAccount user={{ id: 1, name: "Akash", isAdmin: true }} />);

    const editButton = screen.getByRole("button");

    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveTextContent(/edit/i);
  });

  it("should not render edit button if isAdmin is false", () => {
    render(<UserAccount user={{ id: 1, name: "Akash", isAdmin: false }} />);

    const editButton = screen.queryByRole("button", { name: /edit/i });

    expect(editButton).not.toBeInTheDocument();
  });
});
