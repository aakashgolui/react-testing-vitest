import { render, screen } from "@testing-library/react"
import ExpandableText from "../../src/components/ExpandableText"
import userEvent from "@testing-library/user-event";

describe('ExpandableText', () => {
    const longText = 'a'.repeat(256);

    const renderComponent = (text: string) => {
        render(<ExpandableText text={text} />);

        return {
            article: screen.getByRole('article'),
            button: screen.getByRole('button'),
            user: userEvent.setup()
        }
    }

    it('should render the article without expand button if the text length is <=255 characters', () => {
        const text = "Short text."
        render(<ExpandableText text={text} />);

        expect(screen.getByRole('article')).toHaveTextContent(text);
    })

    it('should render the article with expand button if the text length is >255 characters', () => {

        const { article, button } = renderComponent(longText);

        expect(article.textContent).toHaveLength(258); // extra 3 count for the 3 dot (...)

        expect(button).toHaveTextContent('Show More');
    })

    it('should expand the article on clicking btn', async () => {
        const { article, button, user } = renderComponent(longText);

        await user.click(button);

        expect(article.textContent).toHaveLength(longText.length);
        expect(article).toBeInTheDocument();

        expect(button).toHaveTextContent('Show Less');
    })

    it('should collapse the article on clicking btn', async () => {
        const { article, button, user } = renderComponent(longText);
        await user.click(button);

        await user.click(button);

        expect(article.textContent).toHaveLength(258); // extra 3 count for the 3 dot (...)

        expect(button).toHaveTextContent(/more/i);
    })
})