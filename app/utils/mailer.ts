import nodemailer, { Transporter } from "nodemailer";

let cachedTransporter: Transporter | null = null;

/**
 * Returns a singleton Nodemailer transporter configured from environment variables.
 *
 * Required env vars:
 *   EMAIL_SERVER_HOST
 *   EMAIL_SERVER_PORT
 *   EMAIL_SERVER_USER
 *   EMAIL_SERVER_PASSWORD
 *   EMAIL_FROM
 */
export function getTransporter(): Transporter {
    if (cachedTransporter) return cachedTransporter;

    const host = process.env.EMAIL_SERVER_HOST;
    const port = Number(process.env.EMAIL_SERVER_PORT || 587);
    const user = process.env.EMAIL_SERVER_USER;
    const pass = process.env.EMAIL_SERVER_PASSWORD;

    if (!host || !user || !pass) {
        throw new Error(
            "Email transporter not configured. Set EMAIL_SERVER_HOST, EMAIL_SERVER_USER and EMAIL_SERVER_PASSWORD."
        );
    }

    cachedTransporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });

    return cachedTransporter;
}

export const DEFAULT_FROM =
    process.env.EMAIL_FROM ?? "HeyInvoice <hello@heyinvoice.online>";

interface InvoiceItemForEmail {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
}

interface InvoiceEmailParams {
    to: string;
    subject: string;
    clientName: string;
    invoiceNumber: number | string;
    dueDateLabel: string;
    totalAmount: string;
    invoiceLink: string;
    items?: InvoiceItemForEmail[];
    intro?: string;
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function buildItemsTable(items: InvoiceItemForEmail[]) {
    if (!items || items.length === 0) return "";
    const rows = items
        .map(
            (it) => `
        <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #eef0f4;">${escapeHtml(
                it.description
            )}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #eef0f4;text-align:center;">${
                it.quantity
            }</td>
            <td style="padding:8px 12px;border-bottom:1px solid #eef0f4;text-align:right;">₹${it.rate.toFixed(
                2
            )}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #eef0f4;text-align:right;font-weight:600;">₹${it.amount.toFixed(
                2
            )}</td>
        </tr>`
        )
        .join("");

    return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0;font-size:14px;">
        <thead>
            <tr style="background:#f6f8fb;color:#475569;">
                <th align="left" style="padding:10px 12px;">Description</th>
                <th style="padding:10px 12px;">Qty</th>
                <th align="right" style="padding:10px 12px;">Rate</th>
                <th align="right" style="padding:10px 12px;">Amount</th>
            </tr>
        </thead>
        <tbody>${rows}</tbody>
    </table>`;
}

function baseTemplate({
    clientName,
    invoiceNumber,
    dueDateLabel,
    totalAmount,
    invoiceLink,
    items,
    intro,
}: InvoiceEmailParams) {
    const itemsTable = items ? buildItemsTable(items) : "";
    return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 8px 24px rgba(15,23,42,0.06);">
                    <tr>
                        <td style="background:linear-gradient(135deg,#3b82f6 0%,#14b8a6 50%,#22c55e 100%);padding:28px 32px;color:white;">
                            <p style="margin:0;font-size:13px;letter-spacing:.08em;text-transform:uppercase;opacity:.85;">HeyInvoice</p>
                            <h1 style="margin:6px 0 0;font-size:24px;font-weight:700;">Invoice #${escapeHtml(
                                String(invoiceNumber)
                            )}</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:28px 32px;">
                            <p style="margin:0 0 12px;font-size:16px;">Hi ${escapeHtml(
                                clientName
                            )},</p>
                            <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#334155;">${escapeHtml(
                                intro ??
                                    "A new invoice has been issued to you. The details are below."
                            )}</p>

                            ${itemsTable}

                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 24px;font-size:14px;">
                                <tr>
                                    <td style="color:#64748b;padding:6px 0;">Due:</td>
                                    <td align="right" style="padding:6px 0;">${escapeHtml(
                                        dueDateLabel
                                    )}</td>
                                </tr>
                                <tr>
                                    <td style="color:#64748b;padding:6px 0;border-top:1px solid #eef0f4;">Total:</td>
                                    <td align="right" style="padding:6px 0;font-weight:700;font-size:16px;border-top:1px solid #eef0f4;">${escapeHtml(
                                        totalAmount
                                    )}</td>
                                </tr>
                            </table>

                            <a href="${escapeHtml(
                                invoiceLink
                            )}" style="display:inline-block;padding:12px 22px;background:linear-gradient(135deg,#3b82f6,#14b8a6);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">View &amp; Download Invoice</a>

                            <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">If the button doesn't work, copy and paste this link in your browser:<br/><span style="color:#3b82f6;word-break:break-all;">${escapeHtml(
                                invoiceLink
                            )}</span></p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:18px 32px;background:#f8fafc;color:#94a3b8;font-size:12px;text-align:center;">
                            Sent with ❤️ via HeyInvoice
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

export async function sendInvoiceEmail(params: InvoiceEmailParams) {
    const transporter = getTransporter();
    const html = baseTemplate(params);
    const text = `Hi ${params.clientName},\n\nInvoice #${params.invoiceNumber} — Total: ${params.totalAmount}, Due: ${params.dueDateLabel}.\nView it here: ${params.invoiceLink}\n\n— HeyInvoice`;

    return transporter.sendMail({
        from: DEFAULT_FROM,
        to: params.to,
        subject: params.subject,
        html,
        text,
    });
}
