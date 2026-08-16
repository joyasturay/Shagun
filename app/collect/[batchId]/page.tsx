import { auth } from "app/lib/auth";
import prisma from "@/db/lib/prisma";
import { redirect } from "next/navigation";
import GiftForm from "@/components/ui/GiftForm";
import Link from "next/link";

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

  if (!batch) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-snow-white p-8 text-center">
        <div>
          <span className="code-pill mb-4">ERR-404</span>
          <p className="text-[length:var(--text-body-sm)] text-pewter">Invalid QR code</p>
        </div>
      </div>
    );
  }

  if (batch.isSealed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-snow-white p-8 text-center">
        <div>
          <span className="badge-outline mb-4">Sealed</span>
          <p className="text-[length:var(--text-body-sm)] text-pewter">This bag is sealed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-forest-depths">
      <header className="sticky top-0 z-10 border-b border-snow-white/10 bg-forest-depths px-6 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div>
            <Link href="/dashboard" className="mb-1 block text-[length:var(--text-label)] text-snow-white/50 hover:text-snow-white">
              ← Dashboard
            </Link>
            <span className="code-pill border-snow-white text-snow-white">
              Bag #{batch.bagNumber}
            </span>
            <p className="mt-2 text-[length:var(--text-label)] uppercase tracking-wide text-snow-white/60">
              {batch.event.name}
            </p>
          </div>
          <div className="text-right">
            <div className="font-seed-sans-mono text-[length:var(--text-subheading)] font-medium text-snow-white">
              {batch._count.Gifts}
            </div>
            <div className="text-[length:var(--text-micro)] uppercase tracking-wide text-snow-white/50">
              Items inside
            </div>
          </div>
        </div>
      </header>
      <div className="flex-1 px-6 py-8">
        <GiftForm batchId={batchId} />
      </div>
    </div>
  );
}
