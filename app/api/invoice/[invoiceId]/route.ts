import prisma from "@/app/utils/db";
import { NextResponse } from "next/server";
import jsPDF from "jspdf";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ invoiceId: string }> }
) {
    const { invoiceId } = await params;

    const data = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
            items: { orderBy: { position: "asc" } },
        },
    });

    if (!data) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Use multi-items if present; otherwise fall back to legacy single-item columns
    const items =
        data.items && data.items.length > 0
            ? data.items.map((it) => ({
                  description: it.description,
                  quantity: it.quantity,
                  rate: it.rate,
                  discount: it.discount,
                  tax: it.tax,
                  amount: it.amount,
              }))
            : [
                  {
                      description: data.invoiceItemDescription ?? "",
                      quantity: data.invoiceItemQuantity ?? 0,
                      rate: data.invoiceItemRate ?? 0,
                      discount: data.invoiceItemDiscount ?? 0,
                      tax: data.invoiceItemTax ?? 0,
                      amount: data.total,
                  },
              ];

    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const marginX = 18;

    // -------------- Header band --------------
    pdf.setFillColor(59, 130, 246); // blue-500
    pdf.rect(0, 0, pageWidth, 32, "F");
    pdf.setFillColor(20, 184, 166); // teal-500
    pdf.rect(pageWidth * 0.55, 0, pageWidth * 0.45, 32, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.text("INVOICE", marginX, 18);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.text(data.invoiceName, marginX, 26);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text(`#${data.invoiceNumber}`, pageWidth - marginX, 18, { align: "right" });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(`Date: ${data.date.toDateString()}`, pageWidth - marginX, 24, {
        align: "right",
    });
    pdf.text(`Due: ${data.dueDate} days`, pageWidth - marginX, 29, {
        align: "right",
    });

    pdf.setTextColor(15, 23, 42); // slate-900

    // -------------- From / Bill to --------------
    let cursorY = 46;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("FROM", marginX, cursorY);
    pdf.text("BILL TO", pageWidth / 2, cursorY);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(
        [data.fromName, data.fromEmail, data.fromAddress],
        marginX,
        cursorY + 5
    );
    pdf.text(
        [data.clientName, data.clientEmail, data.clientAddress],
        pageWidth / 2,
        cursorY + 5
    );

    cursorY += 30;

    // -------------- Items table --------------
    const colDescX = marginX;
    const colQtyX = 105;
    const colRateX = 125;
    const colDiscX = 148;
    const colTaxX = 165;
    const colAmtX = pageWidth - marginX;

    pdf.setFillColor(248, 250, 252); // slate-50
    pdf.rect(marginX - 2, cursorY - 5, pageWidth - marginX * 2 + 4, 9, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(71, 85, 105); // slate-600
    pdf.text("DESCRIPTION", colDescX, cursorY);
    pdf.text("QTY", colQtyX, cursorY, { align: "right" });
    pdf.text("RATE", colRateX, cursorY, { align: "right" });
    pdf.text("DISC%", colDiscX, cursorY, { align: "right" });
    pdf.text("TAX%", colTaxX, cursorY, { align: "right" });
    pdf.text("AMOUNT", colAmtX, cursorY, { align: "right" });

    cursorY += 6;
    pdf.setTextColor(15, 23, 42);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);

    items.forEach((item, idx) => {
        // Page break guard
        if (cursorY > pageHeight - 60) {
            pdf.addPage();
            cursorY = 30;
        }

        const descLines = pdf.splitTextToSize(item.description || "-", 80);
        const rowHeight = Math.max(8, descLines.length * 5 + 3);

        if (idx % 2 === 1) {
            pdf.setFillColor(250, 251, 253);
            pdf.rect(marginX - 2, cursorY - 4, pageWidth - marginX * 2 + 4, rowHeight, "F");
        }

        pdf.text(descLines, colDescX, cursorY);
        pdf.text(String(item.quantity), colQtyX, cursorY, { align: "right" });
        pdf.text(`Rs. ${item.rate.toFixed(2)}`, colRateX, cursorY, {
            align: "right",
        });
        pdf.text(`${item.discount}%`, colDiscX, cursorY, { align: "right" });
        pdf.text(`${item.tax}%`, colTaxX, cursorY, { align: "right" });
        pdf.text(`Rs. ${item.amount.toFixed(2)}`, colAmtX, cursorY, {
            align: "right",
        });

        cursorY += rowHeight;
    });

    // Divider
    pdf.setDrawColor(226, 232, 240);
    pdf.line(marginX, cursorY + 1, pageWidth - marginX, cursorY + 1);

    // -------------- Totals --------------
    cursorY += 10;
    const subtotal = items.reduce((sum, it) => sum + it.quantity * it.rate, 0);
    const totalDiscount = items.reduce(
        (sum, it) => sum + (it.quantity * it.rate * it.discount) / 100,
        0
    );
    const totalTax = items.reduce((sum, it) => {
        const afterDisc = it.quantity * it.rate - (it.quantity * it.rate * it.discount) / 100;
        return sum + (afterDisc * it.tax) / 100;
    }, 0);

    const totalsX = pageWidth - marginX - 70;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(71, 85, 105);
    pdf.text("Subtotal", totalsX, cursorY);
    pdf.setTextColor(15, 23, 42);
    pdf.text(`Rs. ${subtotal.toFixed(2)}`, colAmtX, cursorY, { align: "right" });

    cursorY += 6;
    pdf.setTextColor(71, 85, 105);
    pdf.text("Discount", totalsX, cursorY);
    pdf.setTextColor(15, 23, 42);
    pdf.text(`- Rs. ${totalDiscount.toFixed(2)}`, colAmtX, cursorY, {
        align: "right",
    });

    cursorY += 6;
    pdf.setTextColor(71, 85, 105);
    pdf.text("Tax", totalsX, cursorY);
    pdf.setTextColor(15, 23, 42);
    pdf.text(`+ Rs. ${totalTax.toFixed(2)}`, colAmtX, cursorY, { align: "right" });

    cursorY += 8;
    pdf.setDrawColor(15, 23, 42);
    pdf.line(totalsX, cursorY - 3, colAmtX, cursorY - 3);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text("Total (INR)", totalsX, cursorY + 2);
    pdf.setTextColor(20, 184, 166);
    pdf.text(`Rs. ${data.total.toFixed(2)}`, colAmtX, cursorY + 2, {
        align: "right",
    });

    // -------------- Note --------------
    if (data.note) {
        cursorY += 18;
        if (cursorY > pageHeight - 30) {
            pdf.addPage();
            cursorY = 30;
        }
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(71, 85, 105);
        pdf.text("Note", marginX, cursorY);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(15, 23, 42);
        const noteLines = pdf.splitTextToSize(data.note, pageWidth - marginX * 2);
        pdf.text(noteLines, marginX, cursorY + 5);
    }

    // -------------- Footer --------------
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text(
        "Generated by HeyInvoice — heyinvoice.online",
        pageWidth / 2,
        pageHeight - 8,
        { align: "center" }
    );

    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": "inline",
        },
    });
}
