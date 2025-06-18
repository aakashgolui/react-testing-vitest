import { Suspense, useState } from "react";
import "react-loading-skeleton/dist/skeleton.css";
import CategorySelect from "../components/CategorySelect";
import ProductsTable from "../components/ProductsTable";

function BrowseProducts() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >();

  return (
    <div>
      <h1>Products</h1>
      <div className="max-w-xs">
        <Suspense fallback={<h1>Loading...</h1>}>
          <CategorySelect setSelectedCategoryId={setSelectedCategoryId} />
        </Suspense>
      </div>
      <Suspense fallback={<h1>Loading...</h1>}>
        <ProductsTable selectedCategoryId={selectedCategoryId} />
      </Suspense>
    </div>
  );
}

export default BrowseProducts;
