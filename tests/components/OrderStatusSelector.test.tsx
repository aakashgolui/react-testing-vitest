import { render, screen } from "@testing-library/react"
import OrderStatusSelector from "../../src/components/OrderStatusSelector"
import { Theme } from "@radix-ui/themes"
import userEvent from "@testing-library/user-event"

describe('OrderStatusSelector', () => {
    const renderComponent = () => {
        render(
            <Theme>
                <OrderStatusSelector onChange={vi.fn()} />
            </Theme>
        );
        return {
            user: userEvent.setup(),
            button: screen.getByRole('combobox'),
        }
    }

    describe('OrderStatusSelector', () => {
        it('should render New as default value', () => {
            const { button } = renderComponent();

            expect(button).toHaveTextContent(/New/i);
        })
    });

    it('should render correct statuses', async () => {
        const { button, user, } = renderComponent();

        await user.click(button);

        const options = await screen.findAllByRole('option');
        expect(options.length).toBe(3);

        const labels = await options.map(option => option.textContent);
        expect(labels).toEqual(['New', 'Processed', 'Fulfilled']);
    })
})