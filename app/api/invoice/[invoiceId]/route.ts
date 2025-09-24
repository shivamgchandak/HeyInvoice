import prisma from "@/app/utils/db";
import { NextResponse } from "next/server";
import jsPDF from "jspdf";

export async function GET(request: Request, {params}: {params: Promise<{invoiceId: string}>}){
    const {invoiceId} = await params;
    
    const data = await prisma.invoice.findUnique({
        where: {
            id: invoiceId,
        },
        select:{
            invoiceName: true,
            invoiceNumber: true,
            currency: true,
            fromName: true,
            fromEmail: true,
            fromAddress: true,
            clientName: true,
            clientEmail: true,
            clientAddress: true,
            date: true,
            dueDate: true,
            invoiceItemDescription: true,
            invoiceItemQuantity: true,
            invoiceItemRate: true,
            invoiceItemDiscount: true,
            invoiceItemTax: true,
            total: true,
            note: true,
        },
    });

    if(!data){
        return NextResponse.json({error: 'Invoice not found'}, {status: 404});
    }

    const pdf = new jsPDF({
       orientation: "portrait",
       unit: "mm",
       format: "a4", 
    });

    pdf.setFont("helvetica");

    pdf.setFontSize(24);
    pdf.text(data.invoiceName, 20, 20);

    pdf.setFontSize(12);
    pdf.text("From,", 20, 40);
    pdf.setFontSize(10);
    pdf.text([data.fromName, data.fromEmail, data.fromAddress], 20, 45);

    pdf.setFontSize(12);
    pdf.text("Bill to,", 20, 70);
    pdf.setFontSize(10);
    pdf.text([data.clientName, data.clientEmail, data.clientAddress], 20, 75);

    pdf.setFontSize(10);
    pdf.text(`Invoice Number: #${data.invoiceNumber}`, 120, 40);
    pdf.text(`Date: ${data.date.toDateString()}`, 120, 45);
    pdf.text(`Due Date: ${data.dueDate} days`, 120, 50);

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("Description", 20, 100);
    pdf.text("Quantity", 80, 100);
    pdf.text("Rate", 110, 100);
    pdf.text("Discount", 130, 100);
    pdf.text("Tax", 150, 100);
    pdf.text("Total", 170, 100);

    pdf.line(20, 102, 200, 102);

    pdf.setFont("helvetica", "Normal");
    pdf.text(data.invoiceItemDescription, 20, 110);
    pdf.text(data.invoiceItemQuantity.toString(), 80, 110);
    pdf.text(`Rs. ${data.invoiceItemRate.toString()}`, 110, 110);
    pdf.text(`${data.invoiceItemDiscount.toString()} %`, 130, 110);
    pdf.text(`${data.invoiceItemTax.toString()} %`, 150, 110);
    pdf.text(`Rs. ${data.total.toString()}`, 170, 110);

    pdf.line(20, 115, 200, 115);

    pdf.setFont("helvetica", "bold");
    pdf.text("Total (INR)", 130, 130);
    pdf.text(`Rs. ${data.total.toString()}`, 160, 130);

    if(data.note){
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.text("Note:", 20, 150);
        pdf.text(data.note, 20, 155);
    }

    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
        headers:{
            "Content-Type": "application/pdf",
            "Content-Disposition": "inline",
        },
    })
}