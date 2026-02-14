import SiteHeader from "@/components/site-header"
import ProductContent from "./product-content"

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return <ProductContent slug={slug} />
}
