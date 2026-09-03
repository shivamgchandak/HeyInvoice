"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, IndianRupeeIcon, User } from "lucide-react";
import { useEffect, useState } from "react";

function useCountUp(end: number, duration = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);

  return count;
}

export function DashboardBlocks({
  totalRevenue,
  totalInvoices,
  paidInvoices,
  openInvoices,
}: {
  totalRevenue: number;
  totalInvoices: number;
  paidInvoices: number;
  openInvoices: number;
}) {
  const revenueCount = useCountUp(totalRevenue);
  const invoicesCount = useCountUp(totalInvoices);
  const paidCount = useCountUp(paidInvoices);
  const openCount = useCountUp(openInvoices);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <IndianRupeeIcon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold">₹{revenueCount}</h2>
          <p className="text-xs text-muted-foreground">Total revenue till now!</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Total Invoices Issued</CardTitle>
          <User className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold">+{invoicesCount}</h2>
          <p className="text-xs text-muted-foreground">Total invoices issued!</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
          <CreditCard className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold">+{paidCount}</h2>
          <p className="text-xs text-muted-foreground">Total invoices which have been paid!</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
          <Activity className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold">+{openCount}</h2>
          <p className="text-xs text-muted-foreground">Invoices which are currently pending!</p>
        </CardContent>
      </Card>
    </div>
  );
}
