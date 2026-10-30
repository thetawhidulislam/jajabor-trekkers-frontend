import { DestinationEditor } from "@/components/admin/destination-editor";

export default async function EditAdminDestinationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DestinationEditor destinationId={id} />;
}
