# HeyInvoice v2 — Upgrade Notes

You are on the `version-2` branch. This release adds:

- **Multiple line items per invoice** — add/remove rows with live totals.
- **Redesigned PDF** — multi-row item table, branded header band, totals breakdown (subtotal / discount / tax / total).
- **Nodemailer-based email** — swapped Mailtrap SDK for a generic SMTP transporter that sends a polished HTML invoice email with the items table inlined.
- **Refreshed UI** — softer color palette, gradient accents, glassy cards, hover-lift dashboards, animated hero.

## After pulling this branch you MUST run

```bash
# 1. Regenerate the Prisma client against the new schema
pnpm prisma generate

# 2. Push the InvoiceItem table to your database
pnpm prisma db push

# (optional) install proper nodemailer typings — the repo ships with a small
#            ambient declaration so the build works without them.
pnpm add -D @types/nodemailer
```

Until `prisma generate` runs locally, `tsc` will report `items` errors on the
new `InvoiceItem` relation — that is expected and clears immediately afterward.

## SMTP env vars

The Nodemailer transporter reads these:

```
EMAIL_SERVER_HOST=...
EMAIL_SERVER_PORT=587          # 465 = TLS, anything else = STARTTLS
EMAIL_SERVER_USER=...
EMAIL_SERVER_PASSWORD=...
EMAIL_FROM="HeyInvoice <hello@heyinvoice.online>"
```

Your existing `.env` already has Mailtrap SMTP creds under those names, so no
change is needed there.

## Schema changes

`Invoice.invoiceItem*` columns are now **optional** so old rows keep working;
new invoices write to the `InvoiceItem` table. The first item is also
denormalized back onto the legacy columns for any v1 readers.
