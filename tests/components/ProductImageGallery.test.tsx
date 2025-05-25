import { render, screen, } from "@testing-library/react"
import ProductImageGallery from "../../src/components/ProductImageGallery"

describe('ProductImageGallery', () => {
    it('should render empty DOM is no image available', () => {
        const { container } = render(<ProductImageGallery imageUrls={[]} />)

        expect(container.innerHTML).toBe('');
        expect(container.firstChild).toBeNull();
    })

    it('should render list of images if image url are provided', () => {
        const urls = [
            "https://placehold.co/600x400",
            "https://placehold.co/600x400?hh",
            "https://placehold.co/600x400?76576",
        ]

        render(<ProductImageGallery imageUrls={urls} />);

        const images = screen.getAllByRole("img");

        images.forEach((img, index) => {
            expect(img).toHaveAttribute("src", urls[index]);
        });
    })
})