"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import { Submitbutton } from "./SubmitButtons";
import { createInvoice } from "../actions";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { invoiceSchema } from "../utils/zodSchemas";

interface iAppProps {
    firstName: string;
    lastName: string;
    address: string;
    email: string;
}

type LineItem = {
    id: string;
    description: string;
    quantity: string;
    rate: string;
    discount: string;
    tax: string;
};

const newItem = (): LineItem => ({
    id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2),
    description: "",
    quantity: "",
    rate: "",
    discount: "0",
    tax: "0",
});

function computeAmount(item: LineItem) {
    const qty = parseFloat(item.quantity) || 0;
    const rt = parseFloat(item.rate) || 0;
    const disc = parseFloat(item.discount) || 0;
    const tx = parseFloat(item.tax) || 0;
    const subtotal = qty * rt;
    const afterDiscount = subtotal - (subtotal * disc) / 100;
    const taxed = afterDiscount + (afterDiscount * tx) / 100;
    return { subtotal, afterDiscount, taxed };
}

export function CreateInvoice({
    address,
    email,
    firstName,
    lastName,
}: iAppProps) {
    const [lastResult, action] = useActionState(createInvoice, undefined);
    const [form, fields] = useForm({
        lastResult,
        onValidate({ formData }) {
            return parseWithZod(formData, { schema: invoiceSchema });
        },
        shouldValidate: "onBlur",
        shouldRevalidate: "onInput",
    });

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [items, setItems] = useState<LineItem[]>([newItem()]);

    const updateItem = (id: string, key: keyof LineItem, value: string) => {
        setItems((prev) =>
            prev.map((it) => (it.id === id ? { ...it, [key]: value } : it))
        );
    };

    const addItem = () => setItems((prev) => [...prev, newItem()]);
    const removeItem = (id: string) =>
        setItems((prev) =>
            prev.length === 1 ? prev : prev.filter((it) => it.id !== id)
        );

    const totals = useMemo(() => {
        let subtotal = 0;
        let afterDiscount = 0;
        let total = 0;
        items.forEach((it) => {
            const c = computeAmount(it);
            subtotal += c.subtotal;
            afterDiscount += c.afterDiscount;
            total += c.taxed;
        });
        return { subtotal, afterDiscount, total };
    }, [items]);

    // Serialize items for form submission
    const itemsPayload = useMemo(
        () =>
            JSON.stringify(
                items.map((it) => ({
                    description: it.description,
                    quantity: parseFloat(it.quantity) || 0,
                    rate: parseFloat(it.rate) || 0,
                    discount: parseFloat(it.discount) || 0,
                    tax: parseFloat(it.tax) || 0,
                }))
            ),
        [items]
    );

    return (
        <div>
            <Card className="w-full max-w-6xl mx-auto shadow-lg border-border/60 bg-gradient-to-br from-background to-muted/30">
                <CardContent className="p-8">
                    <form
                        id={form.id}
                        action={action}
                        onSubmit={form.onSubmit}
                        noValidate
                    >
                        <input
                            type="hidden"
                            name={fields.date.name}
                            value={selectedDate.toISOString()}
                        />
                        <input
                            type="hidden"
                            name={fields.total.name}
                            value={totals.total.toFixed(2)}
                        />
                        <input
                            type="hidden"
                            name={fields.items.name}
                            value={itemsPayload}
                        />

                        <div className="flex flex-col gap-1 w-fit mb-8">
                            <div className="flex items-center gap-4">
                                <Badge
                                    variant="secondary"
                                    className="bg-gradient-to-r from-blue-500/15 to-teal-500/15 text-blue-600 border-blue-500/20"
                                >
                                    Draft
                                </Badge>
                                <Input
                                    name={fields.invoiceName.name}
                                    key={fields.invoiceName.key}
                                    defaultValue={fields.invoiceName.initialValue}
                                    placeholder="Invoice Name"
                                    className="text-lg font-semibold"
                                />
                            </div>
                            <p className="text-sm text-red-500">
                                {fields.invoiceName.errors}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 mb-6">
                            <div>
                                <Label>Invoice No.</Label>
                                <div className="flex">
                                    <span className="px-3 border border-r-0 rounded-l-md bg-muted flex items-center">
                                        #
                                    </span>
                                    <Input
                                        name={fields.invoiceNumber.name}
                                        key={fields.invoiceNumber.key}
                                        defaultValue={fields.invoiceNumber.initialValue}
                                        placeholder="5"
                                        className="rounded-l-none"
                                    />
                                </div>
                                <p className="text-sm text-red-500">
                                    {fields.invoiceNumber.errors}
                                </p>
                            </div>
                            <div>
                                <Label>Currency</Label>
                                <Select
                                    defaultValue="INR"
                                    name={fields.currency.name}
                                    key={fields.currency.key}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Currency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INR">
                                            Indian Rupees -- INR
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-red-500">
                                    {fields.currency.errors}
                                </p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <Label>From</Label>
                                <div className="space-y-2">
                                    <Input
                                        name={fields.fromName.name}
                                        key={fields.fromName.key}
                                        placeholder="Your Name"
                                        defaultValue={firstName + " " + lastName}
                                    />
                                    <p className="text-sm text-red-500">
                                        {fields.fromName.errors}
                                    </p>
                                    <Input
                                        name={fields.fromEmail.name}
                                        key={fields.fromEmail.key}
                                        placeholder="Your Email"
                                        defaultValue={email}
                                    />
                                    <p className="text-sm text-red-500">
                                        {fields.fromEmail.errors}
                                    </p>
                                    <Input
                                        name={fields.fromAddress.name}
                                        key={fields.fromAddress.key}
                                        placeholder="Your Address"
                                        defaultValue={address}
                                    />
                                    <p className="text-sm text-red-500">
                                        {fields.fromAddress.errors}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <Label>To</Label>
                                <div className="space-y-2">
                                    <Input
                                        name={fields.clientName.name}
                                        key={fields.clientName.key}
                                        defaultValue={fields.clientName.initialValue}
                                        placeholder="Client Name"
                                    />
                                    <p className="text-sm text-red-500">
                                        {fields.clientName.errors}
                                    </p>
                                    <Input
                                        name={fields.clientEmail.name}
                                        key={fields.clientEmail.key}
                                        defaultValue={fields.clientEmail.initialValue}
                                        placeholder="Client Email"
                                    />
                                    <p className="text-sm text-red-500">
                                        {fields.clientEmail.errors}
                                    </p>
                                    <Input
                                        name={fields.clientAddress.name}
                                        key={fields.clientAddress.key}
                                        defaultValue={fields.clientAddress.initialValue}
                                        placeholder="Client Address"
                                    />
                                    <p className="text-sm text-red-500">
                                        {fields.clientAddress.errors}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <Label>Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start">
                                            <CalendarIcon />
                                            {selectedDate ? (
                                                new Intl.DateTimeFormat("en-IN", {
                                                    dateStyle: "long",
                                                }).format(selectedDate)
                                            ) : (
                                                <span>Pick a Date</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <Calendar
                                            selected={selectedDate}
                                            onSelect={(date) =>
                                                setSelectedDate(date || new Date())
                                            }
                                            mode="single"
                                            disabled={{
                                                before: new Date(
                                                    new Date().setDate(new Date().getDate() - 90)
                                                ),
                                                after: new Date(
                                                    new Date().setDate(new Date().getDate() + 90)
                                                ),
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <p className="text-sm text-red-500">
                                    {fields.date.errors}
                                </p>
                            </div>

                            <div>
                                <Label>Invoice Due</Label>
                                <Select
                                    name={fields.dueDate.name}
                                    key={fields.dueDate.key}
                                    defaultValue={fields.dueDate.initialValue}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select due date" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">Due on Receipt</SelectItem>
                                        <SelectItem value="15">15 Days</SelectItem>
                                        <SelectItem value="30">30 Days</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-red-500">
                                    {fields.dueDate.errors}
                                </p>
                            </div>
                        </div>

                        {/* Items section */}
                        <div className="mb-6 rounded-lg border bg-card/50 p-4">
                            <div className="hidden md:grid grid-cols-14 gap-3 mb-2 font-medium text-sm text-muted-foreground">
                                <p className="col-span-4">Description</p>
                                <p className="col-span-2">Quantity</p>
                                <p className="col-span-2">Rate</p>
                                <p className="col-span-2">Discount (%)</p>
                                <p className="col-span-2">Tax (%)</p>
                                <p className="col-span-2">Amount</p>
                            </div>

                            {items.map((it, idx) => {
                                const amount = computeAmount(it).taxed;
                                return (
                                    <div
                                        key={it.id}
                                        className="grid grid-cols-1 md:grid-cols-14 gap-3 mb-3 items-start group"
                                    >
                                        <div className="md:col-span-4">
                                            <Textarea
                                                placeholder={`Item ${idx + 1} - Name & description`}
                                                className="min-h-[44px]"
                                                value={it.description}
                                                onChange={(e) =>
                                                    updateItem(it.id, "description", e.target.value)
                                                }
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Input
                                                type="number"
                                                placeholder="Qty"
                                                value={it.quantity}
                                                onChange={(e) =>
                                                    updateItem(it.id, "quantity", e.target.value)
                                                }
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Input
                                                type="number"
                                                placeholder="Rate"
                                                value={it.rate}
                                                onChange={(e) =>
                                                    updateItem(it.id, "rate", e.target.value)
                                                }
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={it.discount}
                                                onChange={(e) =>
                                                    updateItem(it.id, "discount", e.target.value)
                                                }
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={it.tax}
                                                onChange={(e) =>
                                                    updateItem(it.id, "tax", e.target.value)
                                                }
                                            />
                                        </div>
                                        <div className="md:col-span-2 flex items-center gap-2">
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                disabled
                                                className="bg-muted/40"
                                                value={amount.toFixed(2)}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeItem(it.id)}
                                                disabled={items.length === 1}
                                                aria-label="Remove item"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}

                            <Button
                                type="button"
                                variant="outline"
                                onClick={addItem}
                                className="mt-2 border-dashed hover:border-blue-500 hover:text-blue-600"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add another item
                            </Button>

                            <p className="text-sm text-red-500 mt-2">
                                {fields.items.errors}
                            </p>
                        </div>

                        <div className="flex justify-end mb-6">
                            <div className="w-full sm:w-1/2 md:w-1/3 rounded-lg border bg-card/50 p-4">
                                <div className="flex justify-between py-1 text-sm text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>₹{totals.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between py-1 text-sm text-muted-foreground">
                                    <span>After Discount</span>
                                    <span>₹{totals.afterDiscount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-t mt-2">
                                    <span className="font-medium">Total (INR)</span>
                                    <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                                        ₹{totals.total.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <Label>Note</Label>
                            <Textarea
                                name={fields.note.name}
                                key={fields.note.key}
                                defaultValue={fields.note.initialValue}
                                placeholder="Add your Note/s right here..."
                            />
                            <p className="text-sm text-red-500">{fields.note.errors}</p>
                        </div>

                        <div className="flex items-center justify-end mt-6">
                            <div className="cursor-pointer">
                                <Submitbutton text="Send Invoice to Client" />
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
