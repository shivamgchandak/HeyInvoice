"use server";

import { requireUser } from "./utils/hooks";
import { parseWithZod } from "@conform-to/zod";
import { invoiceSchema, onbordingSchema } from "./utils/zodSchemas";
import prisma from "./utils/db";
import { redirect } from "next/navigation";
import { sendInvoiceEmail } from "./utils/mailer";

function buildInvoiceLink(id: string) {
    const base =
        process.env.NODE_ENV !== "production"
            ? "http://localhost:3000"
            : "https://www.heyinvoice.online";
    return `${base}/api/invoice/${id}`;
}

function computeItemAmount(item: {
    quantity: number;
    rate: number;
    discount: number;
    tax: number;
}) {
    const subtotal = item.quantity * item.rate;
    const afterDiscount = subtotal - (subtotal * item.discount) / 100;
    const taxed = afterDiscount + (afterDiscount * item.tax) / 100;
    return taxed;
}

export async function onboardUser(prevState: unknown, formData: FormData) {
    const session = await requireUser();

    const submission = parseWithZod(formData, {
        schema: onbordingSchema,
    });

    if (submission.status !== "success") {
        return submission.reply();
    }

    await prisma.user.update({
        where: { id: session.user?.id },
        data: {
            firstName: submission.value.firstName,
            lastName: submission.value.lastName,
            address: submission.value.address,
        },
    });

    return redirect("/dashboard");
}

export async function createInvoice(prevState: unknown, formData: FormData) {
    const session = await requireUser();

    const submission = parseWithZod(formData, {
        schema: invoiceSchema,
    });

    if (submission.status !== "success") {
        return submission.reply();
    }

    const v = submission.value;

    // Build items with computed amounts and positions
    const itemsCreate = v.items.map((it, idx) => ({
        description: it.description,
        quantity: it.quantity,
        rate: it.rate,
        discount: it.discount,
        tax: it.tax,
        amount: computeItemAmount(it),
        position: idx,
    }));

    const data = await prisma.invoice.create({
        data: {
            clientAddress: v.clientAddress,
            clientEmail: v.clientEmail,
            clientName: v.clientName,
            currency: v.currency,
            date: v.date,
            dueDate: v.dueDate,
            fromAddress: v.fromAddress,
            fromEmail: v.fromEmail,
            fromName: v.fromName,
            invoiceName: v.invoiceName,
            invoiceNumber: v.invoiceNumber,
            status: v.status,
            total: v.total,
            note: v.note,
            // Keep first item denormalized into legacy columns for backward compatibility
            invoiceItemDescription: v.items[0]?.description ?? null,
            invoiceItemQuantity: v.items[0]?.quantity ?? null,
            invoiceItemRate: v.items[0]?.rate ?? null,
            invoiceItemDiscount: v.items[0]?.discount ?? null,
            invoiceItemTax: v.items[0]?.tax ?? null,
            userId: session.user?.id,
            items: {
                create: itemsCreate,
            },
        },
    });

    try {
        await sendInvoiceEmail({
            to: v.clientEmail,
            subject: `Invoice #${v.invoiceNumber} from ${v.fromName}`,
            clientName: v.clientName,
            invoiceNumber: v.invoiceNumber,
            dueDateLabel: `${v.dueDate} days from ${new Date(v.date).toDateString()}`,
            totalAmount: `₹${v.total.toFixed(2)}`,
            invoiceLink: buildInvoiceLink(data.id),
            items: itemsCreate.map((it) => ({
                description: it.description,
                quantity: it.quantity,
                rate: it.rate,
                amount: it.amount,
            })),
            intro: `${v.fromName} has issued you a new invoice. You can review the line items below and download the PDF copy.`,
        });
    } catch (err) {
        // Don't fail the whole action if SMTP misbehaves
        console.error("Failed to send invoice email:", err);
    }

    return redirect("/dashboard/invoices");
}

export async function editInvoice(prevState: unknown, formdata: FormData) {
    const session = await requireUser();

    const submission = parseWithZod(formdata, {
        schema: invoiceSchema,
    });

    if (submission.status !== "success") {
        return submission.reply();
    }

    const v = submission.value;
    const invoiceId = formdata.get("id") as string;

    const itemsCreate = v.items.map((it, idx) => ({
        description: it.description,
        quantity: it.quantity,
        rate: it.rate,
        discount: it.discount,
        tax: it.tax,
        amount: computeItemAmount(it),
        position: idx,
    }));

    const data = await prisma.invoice.update({
        where: {
            id: invoiceId,
            userId: session.user?.id,
        },
        data: {
            clientAddress: v.clientAddress,
            clientEmail: v.clientEmail,
            clientName: v.clientName,
            currency: v.currency,
            date: v.date,
            dueDate: v.dueDate,
            fromAddress: v.fromAddress,
            fromEmail: v.fromEmail,
            fromName: v.fromName,
            invoiceName: v.invoiceName,
            invoiceNumber: v.invoiceNumber,
            status: v.status,
            total: v.total,
            note: v.note,
            invoiceItemDescription: v.items[0]?.description ?? null,
            invoiceItemQuantity: v.items[0]?.quantity ?? null,
            invoiceItemRate: v.items[0]?.rate ?? null,
            invoiceItemDiscount: v.items[0]?.discount ?? null,
            invoiceItemTax: v.items[0]?.tax ?? null,
            // Replace all items
            items: {
                deleteMany: {},
                create: itemsCreate,
            },
        },
    });

    try {
        await sendInvoiceEmail({
            to: v.clientEmail,
            subject: `Updated Invoice #${v.invoiceNumber} from ${v.fromName}`,
            clientName: v.clientName,
            invoiceNumber: v.invoiceNumber,
            dueDateLabel: `${v.dueDate} days from ${new Date(v.date).toDateString()}`,
            totalAmount: `₹${v.total.toFixed(2)}`,
            invoiceLink: buildInvoiceLink(data.id),
            items: itemsCreate.map((it) => ({
                description: it.description,
                quantity: it.quantity,
                rate: it.rate,
                amount: it.amount,
            })),
            intro: `${v.fromName} has updated invoice #${v.invoiceNumber}. The latest details are below.`,
        });
    } catch (err) {
        console.error("Failed to send invoice email:", err);
    }

    return redirect("/dashboard/invoices");
}

export async function DeleteInvoices(invoiceId: string) {
    const session = await requireUser();

    await prisma.invoice.delete({
        where: {
            userId: session.user?.id,
            id: invoiceId,
        },
    });

    return redirect("/dashboard/invoices");
}

export async function MarkAsPaidAction(invoiceId: string) {
    const session = await requireUser();

    await prisma.invoice.update({
        where: {
            userId: session.user?.id,
            id: invoiceId,
        },
        data: {
            status: "PAID",
        },
    });

    return redirect("/dashboard/invoices");
}
