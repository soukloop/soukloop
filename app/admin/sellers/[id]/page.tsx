import { redirect } from 'next/navigation';

export default async function AdminSellerPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    // Sellers are just users with the SELLER role. The universal user page handles seller profiles.
    redirect(`/admin/users/${params.id}`);
}
