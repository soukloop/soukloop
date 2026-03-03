import SearchResults from "./components/search-results"
import { getAllCategories } from "@/features/categories/queries"
import { getBrands, getDressStyles, getOccasions, getMaterials } from "@/features/products/queries"

export default async function HomePage() {
  const categories = await getAllCategories();
  const brands = await getBrands();
  const dressStyles = await getDressStyles();
  const occasions = await getOccasions();
  const materials = await getMaterials();

  return (
    <SearchResults
      initialCategories={categories}
      initialBrands={brands}
      initialDressStyles={dressStyles}
      initialOccasions={occasions}
      initialMaterials={materials}
    />
  )
}
