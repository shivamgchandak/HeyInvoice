import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InvoiceActions } from "./InvoiceActions";
import prisma from "../utils/db";
import { requireUser } from "../utils/hooks";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "./EmptyState";

async function getData(userId: string) {
    const data = await prisma.invoice.findMany({
        where:{
            userId: userId,
        },
        select:{
            id: true,
            clientName: true,
            total: true,
            createdAt: true,
            status: true,
            invoiceNumber: true,
        },
        orderBy:{
            createdAt: 'desc',
        },
    });
    return data;
}

export async function InvoiceList() {
    const session = await requireUser();
    const data = await getData(session.user?.id as string);
    return(
        <>
            {data.length === 0 ? (
                <EmptyState title="No Invoices found!" description="Create an invoice to see the stats here!"/>
            ):(
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Imvoice ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((invoice) => (
                            <TableRow key={invoice.id}>
                                <TableCell>#{invoice.invoiceNumber}</TableCell>
                                <TableCell>{invoice.clientName}</TableCell>
                                <TableCell>₹{invoice.total}</TableCell>
                                <TableCell><Badge>{invoice.status}</Badge></TableCell>
                                <TableCell>{invoice.createdAt.toDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <InvoiceActions id={invoice.id} status={invoice.status}/>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </>
    )
}