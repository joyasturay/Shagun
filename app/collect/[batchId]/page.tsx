import { auth } from "app/lib/auth";
import prisma from "@/db/lib/prisma";
import { redirect } from "next/navigation";
import GiftForm from "@/components/ui/GiftForm"; // We'll create this next

type Props = {
  params: Promise<{ batchId: string }>;
};

export default async function CollectorPage({ params }: Props) {
  const { batchId } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=/collect/${batchId}`);
  }
  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: {
      event: { select: { name: true } }, 
      _count: { select: { Gifts: true } },
    },
  });

  if (!batch) return <div className="p-8 text-center">Invalid QR Code</div>;
  if (batch.isSealed)
    return (
      <div className="p-8 text-center text-red-600">This bag is sealed.</div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-black text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold">Bag #{batch.bagNumber}</h1>
            <p className="text-xs text-gray-400 uppercase">
              {batch.event.name}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{batch._count.Gifts}</div>
            <div className="text-[10px] text-gray-400 uppercase">
              Items Inside
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 p-4">
        <GiftForm batchId={batchId} />
      </div>
    </div>
  );
}
