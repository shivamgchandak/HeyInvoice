import { z } from "zod";

export const onbordingSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    address: z.string().min(2, "Address is required"),
});

// A single line-item on an invoice
export const invoiceItemSchema = z.object({
    description: z.string().min(1, "Item description is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    rate: z.number().min(0.01, "Rate must be greater than 0"),
    discount: z
        .number()
        .min(0, "Discount cannot be negative")
        .max(100, "Discount cannot exceed 100%")
        .default(0),
    tax: z
        .number()
        .min(0, "Tax cannot be negative")
        .max(100, "Tax cannot exceed 100%")
        .default(0),
});

export const invoiceSchema = z.object({
    invoiceName: z.string().min(1, "Invoice Name is required"),
    total: z.number().min(1, "1 is minimum total"),
    status: z.enum(["PAID", "PENDING"]).default("PENDING"),
    date: z.string().min(1, "Date is Required"),
    dueDate: z.number().min(0, "Due Date is Required"),
    fromName: z.string().min(1, "Your name is required"),
    fromEmail: z.string().email("Invalid Email address"),
    fromAddress: z.string().min(1, "Your Address is required"),
    clientName: z.string().min(1, "Client name is required"),
    clientEmail: z.string().email("Invalid Email address"),
    clientAddress: z.string().min(1, "Client Address is required"),
    currency: z.string().min(1, "Currency is required"),
    invoiceNumber: z.number().min(1, "Minimum invoice number of 1"),
    note: z.string().optional(),
    // v2 — items is a JSON-encoded array (string in form payload, array after parse)
    items: z
        .string()
        .min(1, "Add at least one item")
        .transform((value, ctx) => {
            try {
                const parsed = JSON.parse(value);
                const result = z.array(invoiceItemSchema).min(1, "Add at least one item").safeParse(parsed);
                if (!result.success) {
                    result.error.issues.forEach((issue) => ctx.addIssue(issue));
                    return z.NEVER;
                }
                return result.data;
            } catch {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid items payload" });
                return z.NEVER;
            }
        }),
});

export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
