import { render, screen } from "@testing-library/react"
import OrderStatusSelector from "../../src/components/OrderStatusSelector"
import { Theme } from "@radix-ui/themes"
import userEvent from "@testing-library/user-event"

describe('OrderStatusSelector', () => {
    const renderComponent = () => {
        const onChange = vi.fn();
        render(
            <Theme>
                <OrderStatusSelector onChange={onChange} />
            </Theme>
        );
        return {
            user: userEvent.setup(),
            button: screen.getByRole('combobox'),
            getOptions: () => screen.getAllByRole('option'),
            getOption: (name: RegExp) => screen.getByRole('option', { name }),
            onChange
        }
    }

    describe('OrderStatusSelector', () => {
        it('should render New as default value', () => {
            const { button } = renderComponent();

            expect(button).toHaveTextContent(/New/i);
        })
    });

    it('should render correct statuses', async () => {
        const { button, user, getOptions } = renderComponent();

        await user.click(button);

        const options = getOptions();
        expect(options.length).toBe(3);

        const labels = options.map(option => option.textContent);
        expect(labels).toEqual(['New', 'Processed', 'Fulfilled']);
    })

    it.each([
        { value: 'processed', label: /processed/i },
        { value: 'fulfilled', label: /fulfilled/i }
    ])('should call onChange on selecting $label option with correct value', async ({ label, value }) => {
        const { button, user, onChange, getOption } = renderComponent();
        await user.click(button);

        const option = getOption(label);
        await user.click(option);

        expect(onChange).toHaveBeenCalledWith(value);
    })

    it('should call onChange on selecting new option with correct value', async () => {
        const { button, user, onChange, getOption } = renderComponent();
        await user.click(button);

        const optionFull = getOption(/fulfilled/i);
        await user.click(optionFull);

        await user.click(button);
        const optionNew = getOption(/new/i);
        await user.click(optionNew);

        expect(onChange).toHaveBeenCalledWith('new');
    })
})