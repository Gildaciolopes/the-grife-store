"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { productTable, productVariantTable } from "@/db/schema";

import ProductItem from "./product-item";

interface ProductListProps {
  title: string;
  products: (typeof productTable.$inferSelect & {
    variants: (typeof productVariantTable.$inferSelect)[];
  })[];
  viewAllLink?: string;
}

const ProductList = ({ title, products, viewAllLink }: ProductListProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -400,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 400,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-5">
        <h3 className="font-semibold">{title}</h3>
        <div className="hidden items-center md:flex">
          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="hover:text-foreground cursor-pointer px-2 text-sm transition-colors"
            >
              Ver todos
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollLeft}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollRight}
            className="h-8 w-8 p-0"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        ref={scrollContainerRef}
        className="flex w-full gap-4 overflow-x-auto px-5 [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
