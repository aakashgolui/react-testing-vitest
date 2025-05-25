import { render, screen } from "@testing-library/react";
import UserAccount from "../../src/components/UserAccount";
import { User } from "../../src/entities";

describe("UserAccount", () => {
  const user: User = {
    id: 1,
    name: "Akash",
  };

  it("should render username if username is provided", () => {
    render(<UserAccount user={user} />);

    expect(screen.getByText(user.name)).toBeInTheDocument();
  });

  it("should render edit button if isAdmin is true", () => {
    render(<UserAccount user={{ ...user, isAdmin: true }} />);

    const editButton = screen.getByRole("button");

    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveTextContent(/edit/i);
  });

  it("should not render edit button if isAdmin is false", () => {
    render(<UserAccount user={{ ...user, isAdmin: false }} />);

    const editButton = screen.queryByRole("button", { name: /edit/i });

    expect(editButton).not.toBeInTheDocument();
  });
});
