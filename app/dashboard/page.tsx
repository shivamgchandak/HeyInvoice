import Image from "next/image";
import { DashboardBlocks } from "../components/DashboardBlocks";
import { InvoiceGraph } from "../components/InvoiceGraph";
import { RecentInvoices } from "../components/RecentInvoices";
import prisma from "../utils/db";
import { requireUser } from "../utils/hooks";
import thumbsDown from "@/public/thumbs-down.gif"
import { EmptyState } from "../components/EmptyState";

async function getData(userId: string){
    const data = await prisma.invoice.findMany({
        where:{
            userId: userId,
        },
        select:{
            id: true,
        }
    });
    return data;
  }

export default async function DashboardRoute() {
  const session = await requireUser();

  const response = await getData(session.user?.id as string);

  const [data, openInvoices, paidInvoices] = await Promise.all([
    prisma.invoice.findMany({
      where: { userId: session.user?.id },
      select: { total: true },
    }),
    prisma.invoice.findMany({
      where: { userId: session.user?.id, status: "PENDING" },
      select: { id: true },
    }),
    prisma.invoice.findMany({
      where: { userId: session.user?.id, status: "PAID" },
      select: { id: true },
    }),
  ]);

  const totalRevenue = data.reduce((acc, invoice) => acc + invoice.total, 0);
  const totalInvoices = data.length;
  const paidCount = paidInvoices.length;
  const openCount = openInvoices.length;

  return (
    <>
    {data.length < 1 ? (
        <>
            <EmptyState title="No Invoices found!" description="Create an invoice to see the analytics here!" buttontext="Create Invoice" href="/dashboard/invoices/create" background={true}/>
        </>
    ):(
        <>
            <DashboardBlocks
                totalRevenue={totalRevenue}
                totalInvoices={totalInvoices}
                paidInvoices={paidCount}
                openInvoices={openCount}
            />
            <div className="grid gap-4 lg:grid-cols-3 md:gap-8">
                <InvoiceGraph/>
                <RecentInvoices/>
            </div>
        </>
    )}
        
    </>
  );
}
