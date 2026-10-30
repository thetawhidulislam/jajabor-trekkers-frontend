import { redirect } from "next/navigation";

export default async function AdminDestinationRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/destinations/${encodeURIComponent(id)}/edit`);
}
