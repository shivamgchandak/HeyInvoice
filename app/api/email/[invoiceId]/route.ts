import prisma from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import { sendInvoiceEmail } from "@/app/utils/mailer";
import { NextResponse } from "next/server";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ invoiceId: string }> }
) {
    try {
        const session = await requireUser();
        const { invoiceId } = await params;

        const invoiceData = await prisma.invoice.findUnique({
            where: {
                id: invoiceId,
                userId: session.user?.id,
            },
            include: {
                items: { orderBy: { position: "asc" } },
            },
        });

        if (!invoiceData) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        const base =
            process.env.NODE_ENV !== "production"
                ? "http://localhost:3000"
                : "https://www.heyinvoice.online";

        await sendInvoiceEmail({
            to: invoiceData.clientEmail,
            subject: `Reminder: Invoice #${invoiceData.invoiceNumber} from ${invoiceData.fromName}`,
            clientName: invoiceData.clientName,
            invoiceNumber: invoiceData.invoiceNumber,
            dueDateLabel: `${invoiceData.dueDate} days from ${invoiceData.date.toDateString()}`,
            totalAmount: `₹${invoiceData.total.toFixed(2)}`,
            invoiceLink: `${base}/api/invoice/${invoiceData.id}`,
            items:
                invoiceData.items && invoiceData.items.length > 0
                    ? invoiceData.items.map((it) => ({
                          description: it.description,
                          quantity: it.quantity,
                          rate: it.rate,
                          amount: it.amount,
                      }))
                    : undefined,
            intro: `This is a friendly reminder for invoice #${invoiceData.invoiceNumber}. Please review the details below.`,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to send reminder email:", error);
        return NextResponse.json(
            { error: "Failed to send email reminder" },
            { status: 500 }
        );
    }
}
