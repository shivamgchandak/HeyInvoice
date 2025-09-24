import prisma from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks"
import { emailClient } from "@/app/utils/mailtrap";
import { NextResponse } from "next/server";

export async function POST(request: Request, {params} : {params: Promise<{invoiceId: string}>}){
    try {
        const session = await requireUser();

        const {invoiceId} = await params;

        const invoiceData = await prisma.invoice.findUnique({
            where: {
                id: invoiceId,
                userId: session.user?.id,
            },
        });

        if(!invoiceData){
            return NextResponse.json({error: 'Invoice not found'}, {status: 404});
        }

        const sender = {
            email: "hello@heyinvoice.online",
            name: "HeyInvoice",
        };
        
        emailClient.send({
            from: sender,
            to: [{email: invoiceData.clientEmail}],
            template_uuid: "df2e5063-260f-4d68-a7ac-8a2fc48bb405",
            template_variables: {
                "clientName": invoiceData.clientName,
                "invoiceLink": `http://localhost:3000/api/invoice/${invoiceData.id}`,
            }
        });

        return NextResponse.json({success: true});
    } 
    catch (error) {
        return NextResponse.json({error: 'Failed to send email remaindr'}, {status: 500});
    }

}