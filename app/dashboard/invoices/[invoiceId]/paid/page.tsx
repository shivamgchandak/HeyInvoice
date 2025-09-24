import prisma from "@/app/utils/db"
import { requireUser } from "@/app/utils/hooks";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import PaidGif from '@/public/paid-invoice.gif';
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Submitbutton } from "@/app/components/SubmitButtons";
import { MarkAsPaidAction } from "@/app/actions";

async function Authorize(invoiceId: string, userId: string){
    const data = await prisma.invoice.findUnique({
        where:{
            id: invoiceId,
            userId: userId,
        },
    });

    if(!data){
        return redirect("/dashboard/invoices");
    }
}

type Params = Promise<{invoiceId: string}>;

export default async function MarkAsPaid({params,} : {params: Params;}) {
    const {invoiceId} = await params;
    const session = await requireUser();
    await Authorize(invoiceId, session.user?.id as string);
    return(
        <div className="flex flex-1 justify-center items-center">
            <Card className="max-w-[275px] w-full">
                <CardHeader>
                    <CardTitle>Mark as Paid?</CardTitle>
                    <CardDescription>Are you sure that you want to mark this invoice as paid?</CardDescription>
                </CardHeader>
                <CardContent>
                    <Image src={PaidGif} alt="Warning Gif" className="rounded-lg"/>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                    <Link href="/dashboard/invoices" className={buttonVariants({variant: 'secondary'})}>Cancle</Link>
                    <form action={async () => {
                        "use server";
                        await MarkAsPaidAction(invoiceId);
                    }}>
                        <Submitbutton text="Mark as Paid"/>
                    </form>
                </CardFooter>
            </Card>
        </div>
    )
}