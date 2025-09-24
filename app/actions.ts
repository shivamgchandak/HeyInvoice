"use server";

import { Schema } from "zod";
import { requireUser } from "./utils/hooks";
import {parseWithZod} from "@conform-to/zod";
import { invoiceSchema, onbordingSchema } from "./utils/zodSchemas";
import prisma from "./utils/db";
import { redirect } from "next/navigation";
import { emailClient } from "./utils/mailtrap";

export async function onboardUser(prevState: any, formData: FormData) {
    const session = await requireUser();

    const submission = parseWithZod(formData, {
        schema: onbordingSchema,
    });

    if(submission.status !== "success"){
        return submission.reply();
    }

    const data = await prisma.user.update({
        where: {
            id: session.user?.id,
        },
        data:{
            firstName: submission.value.firstName,
            lastName: submission.value.lastName,
            address: submission.value.address,
        }
    });

    return redirect("/dashboard");
}

export async function createInvoice(prevState: any, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: invoiceSchema,
  });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  const data = await prisma.invoice.create({
    data: {
      clientAddress: submission.value.clientAddress,
      clientEmail: submission.value.clientEmail,
      clientName: submission.value.clientName,
      currency: submission.value.currency,
      date: submission.value.date,
      dueDate: submission.value.dueDate,
      fromAddress: submission.value.fromAddress,
      fromEmail: submission.value.fromEmail,
      fromName: submission.value.fromName,
      invoiceName: submission.value.invoiceName,
      invoiceNumber: submission.value.invoiceNumber,
      status: submission.value.status,
      total: submission.value.total,
      note: submission.value.note,
      invoiceItemDescription: submission.value.invoiceItemDescription,
      invoiceItemQuantity: submission.value.invoiceItemQuantity,
      invoiceItemRate: submission.value.invoiceItemRate,
      invoiceItemDiscount: submission.value.invoiceItemDiscount,
      invoiceItemTax: submission.value.invoiceItemTax,
      userId: session.user?.id,
    },
  });

  const sender = {
    email: "hello@heyinvoice.online",
    name: "HeyInvoice",
  };

  emailClient.send({
    from: sender,
    to: [{email: submission.value.clientEmail}],
    template_uuid: "ec89700c-1098-44d1-8410-37bbb8d6b39d",
    template_variables: {
      "clientName": submission.value.clientName,
      "invoiceNumber": submission.value.invoiceNumber,
      "dueDate": `${submission.value.dueDate} days from ${new Date(submission.value.date).toDateString()}`,
      "totalAmount": `₹${submission.value.total}`,
      "invoiceLink": `http://localhost:3000/api/invoice/${data.id}`,
    }
  });

  return redirect("/dashboard/invoices");
}

export async function editInvoice(prevState: any, formdata: FormData){
  const session = await requireUser();

  const submission = parseWithZod(formdata, {
    schema: invoiceSchema,
  });

  if(submission.status !== "success"){
    return submission.reply();
  }

  const data = await prisma.invoice.update({
    where:{
      id: formdata.get('id') as string,
      userId: session.user?.id,
    },
    data:{
      clientAddress: submission.value.clientAddress,
      clientEmail: submission.value.clientEmail,
      clientName: submission.value.clientName,
      currency: submission.value.currency,
      date: submission.value.date,
      dueDate: submission.value.dueDate,
      fromAddress: submission.value.fromAddress,
      fromEmail: submission.value.fromEmail,
      fromName: submission.value.fromName,
      invoiceName: submission.value.invoiceName,
      invoiceNumber: submission.value.invoiceNumber,
      status: submission.value.status,
      total: submission.value.total,
      note: submission.value.note,
      invoiceItemDescription: submission.value.invoiceItemDescription,
      invoiceItemQuantity: submission.value.invoiceItemQuantity,
      invoiceItemRate: submission.value.invoiceItemRate,
      invoiceItemDiscount: submission.value.invoiceItemDiscount,
      invoiceItemTax: submission.value.invoiceItemTax,
    }
  });

  const sender = {
    email: "hello@heyinvoice.online",
    name: "HeyInvoice",
  };

  emailClient.send({
    from: sender,
    to: [{email: submission.value.clientEmail}],
    template_uuid: "fe6c7692-6ae9-466c-90d0-7d75fc164347",
    template_variables: {
      "clientName": submission.value.clientName,
      "invoiceNumber": submission.value.invoiceNumber,
      "dueDate": `${submission.value.dueDate} days from ${new Date(submission.value.date).toDateString()}`,
      "totalAmount": `₹${submission.value.total}`,
      "invoiceLink": `http://localhost:3000/api/invoice/${data.id}`,
    }
  });

  return redirect("/dashboard/invoices");
}

export async function DeleteInvoices(invoiceId: string){
  const session = await requireUser();

  const data = await prisma.invoice.delete({
    where:{
      userId: session.user?.id,
      id: invoiceId,
    },
  });

  return redirect("/dashboard/invoices")
}

export async function MarkAsPaidAction(invoiceId: string){
  const session = await requireUser();

  const data = await prisma.invoice.update({
    where:{
      userId: session.user?.id,
      id: invoiceId,
    },
    data:{
      status: "PAID",
    },
  });

  return redirect("/dashboard/invoices")
}