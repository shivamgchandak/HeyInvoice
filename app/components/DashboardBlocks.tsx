"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, IndianRupeeIcon, User } from "lucide-react";
import { useEffect, useState } from "react";

function useCountUp(end: number, duration = 1500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (end === 0) {
      setCount(0);
      return;
    }
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

interface BlockProps {
  title: string;
  value: string;
  caption: string;
  Icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

function Block({ title, value, caption, Icon, gradient }: BlockProps) {
  return (
    <Card className="hover-lift glass-card overflow-hidden relative group">
      <div
        className={`absolute -top-12 -right-12 size-32 rounded-full opacity-30 blur-2xl transition-opacity group-hover:opacity-50 ${gradient}`}
      />
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className={`flex size-9 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-white shadow-sm`}
        >
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <h2 className="text-2xl font-bold tracking-tight gradient-text">
          {value}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">{caption}</p>
      </CardContent>
    </Card>
  );
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-6">
      <Block
        title="Total Revenue"
        value={`₹${revenueCount.toLocaleString()}`}
        caption="Total revenue till now"
        Icon={IndianRupeeIcon}
        gradient="from-blue-500 to-indigo-500"
      />
      <Block
        title="Total Invoices Issued"
        value={`+${invoicesCount}`}
        caption="Total invoices issued"
        Icon={User}
        gradient="from-teal-500 to-emerald-500"
      />
      <Block
        title="Paid Invoices"
        value={`+${paidCount}`}
        caption="Invoices already paid"
        Icon={CreditCard}
        gradient="from-violet-500 to-fuchsia-500"
      />
      <Block
        title="Pending Invoices"
        value={`+${openCount}`}
        caption="Invoices awaiting payment"
        Icon={Activity}
        gradient="from-amber-500 to-orange-500"
      />
    </div>
  );
}
