import { Header } from "@/components/common/header";
import ProductItem from "@/components/common/product-item";
import { getNewlyCreatedProducts } from "@/data/products/get";

const NewProductsPage = async () => {
  const products = await getNewlyCreatedProducts();

  return (
    <>
      <Header />
      <div className="space-y-6 px-5">
        <h2 className="text-xl font-semibold">Novos produtos</h2>
        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              textContainerClassName="max-w-full"
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default NewProductsPage;
