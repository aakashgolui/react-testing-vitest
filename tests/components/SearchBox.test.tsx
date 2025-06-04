import { render, screen } from "@testing-library/react"
import SearchBox from "../../src/components/SearchBox"
import userEvent from "@testing-library/user-event";

describe('SearchBox', () => {
    const renderComponent = () => {
        const onChange = vi.fn();

        render(<SearchBox onChange={onChange} />)

        return {
            input: screen.getByPlaceholderText(/search/i),
            user: userEvent.setup(),
            onChange
        }
    }

    it('should render the ui with search input box', () => {
        const { input } = renderComponent();

        expect(input).toBeInTheDocument()
    })

    it('should call onChange when Enter is pressed with a search term', async () => {
        const { input, onChange, user } = renderComponent();

        const searchTerm = 'SearchTerm';
        await user.type(input, `${searchTerm}{enter}'`);

        expect(onChange).toHaveBeenCalledWith(searchTerm);
    });

    it('should not call onChange when Enter is pressed with an empty search term', async () => {
        const { input, onChange, user } = renderComponent();

        await user.type(input, '{enter}');

        expect(onChange).not.toHaveBeenCalled();
    });
})