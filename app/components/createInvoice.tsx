"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { Submitbutton } from "./SubmitButtons";
import { createInvoice } from "../actions";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { invoiceSchema } from "../utils/zodSchemas";

interface iAppProps{
    firstName: string;
    lastName: string;
    address: string;
    email: string;
}

export function CreateInvoice({address, email, firstName, lastName} : iAppProps) {
    const [lastResult, action] = useActionState(createInvoice, undefined);
    const [form, fields] = useForm({
        lastResult,

        onValidate({formData}){
            return parseWithZod(formData,{
                schema: invoiceSchema,
            });
        },

        shouldValidate: 'onBlur',
        shouldRevalidate: 'onInput',
    });

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [rate, setRate] = useState("");
    const [quantity, setQuantity] = useState("");
    const [discount, setDiscount] = useState("");
    const [tax, setTax] = useState("");
    const [amount, setAmount] = useState(0);


    useEffect(() => {
    const qty = parseFloat(quantity) || 0;
    const rt = parseFloat(rate) || 0;
    const disc = parseFloat(discount) || 0;
    const tx = parseFloat(tax) || 0;

    let subtotal = qty * rt;
    let discounted = subtotal - (subtotal * disc) / 100;
    let taxed = discounted + (discounted * tx) / 100;

    setAmount(taxed);
    }, [quantity, rate, discount, tax]);

    return (
        <div>
            <Card className="w-full max-w-6xl mx-auto">
                <CardContent className="p-6">
                    <form id={form.id} action={action} onSubmit={form.onSubmit} noValidate>
                        <input type="hidden" name={fields.date.name} value={selectedDate.toISOString()}/>
                        <input type="hidden" name={fields.total.name} value={amount.toFixed(2)}/>
                        <div className="flex flex-col gap-1 w-fit mb-6">
                            <div className="flex items-center gap-4">
                                <Badge variant="secondary">Draft</Badge>
                                <Input 
                                    name={fields.invoiceName.name} 
                                    key={fields.invoiceName.key} 
                                    defaultValue={fields.invoiceName.initialValue} 
                                    placeholder="test 123"
                                />
                            </div>
                            <p className="text-sm text-red-500">{fields.invoiceName.errors}</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 mb-6">
                            <div>
                                <Label>Invoice No.</Label>
                                <div className="flex">
                                    <span className="px-3 border border-r-0 rounded-l-md bg-muted flex items-center">#</span>
                                    <Input 
                                        name={fields.invoiceNumber.name} 
                                        key={fields.invoiceNumber.key} 
                                        defaultValue={fields.invoiceNumber.initialValue}
                                        placeholder="5" 
                                        className="rounded-l-none"
                                    />
                                </div>
                                <p className="text-sm text-red-500">{fields.invoiceNumber.errors}</p>
                            </div>
                            <div>
                                <Label>Currency</Label>
                                <Select 
                                    defaultValue="INR"
                                    name={fields.currency.name} 
                                    key={fields.currency.key}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Currency"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INR">Indian Rupees -- INR</SelectItem>
                                        {/* <SelectItem value="USD">United States Dollar -- USD</SelectItem>
                                        <SelectItem value="EUR">Euro -- EUR</SelectItem> */}
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-red-500">{fields.currency.errors}</p>
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
                                    <p className="text-sm text-red-500">{fields.fromName.errors}</p>
                                    <Input 
                                        name={fields.fromEmail.name} 
                                        key={fields.fromEmail.key}
                                        placeholder="Your Email"
                                        defaultValue={email}
                                    />
                                    <p className="text-sm text-red-500">{fields.fromEmail.errors}</p>
                                    <Input 
                                        name={fields.fromAddress.name} 
                                        key={fields.fromAddress.key}
                                        placeholder="Your Address"
                                        defaultValue={address}
                                    />
                                    <p className="text-sm text-red-500">{fields.fromAddress.errors}</p>
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
                                    <p className="text-sm text-red-500">{fields.clientName.errors}</p>
                                    <Input 
                                        name={fields.clientEmail.name} 
                                        key={fields.clientEmail.key}
                                        defaultValue={fields.clientEmail.initialValue}
                                        placeholder="Client Email"
                                    />
                                    <p className="text-sm text-red-500">{fields.clientEmail.errors}</p>
                                    <Input 
                                        name={fields.clientAddress.name} 
                                        key={fields.clientAddress.key}
                                        defaultValue={fields.clientAddress.initialValue}
                                        placeholder="Client Address"
                                    />
                                    <p className="text-sm text-red-500">{fields.clientAddress.errors}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <div>
                                    <Label>Date</Label>
                                </div>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline">
                                            <CalendarIcon/>

                                            {selectedDate ? (
                                                new Intl.DateTimeFormat("en-IN", {
                                                    dateStyle: 'long'
                                                }).format(selectedDate)
                                            ) : (
                                                <span>Pick a Date</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <Calendar 
                                            selected={selectedDate} 
                                            onSelect={(date) => setSelectedDate(date || new Date())}
                                            mode="single" 
                                            disabled={{
                                                before: new Date(new Date().setDate(new Date().getDate() - 90)), 
                                                after: new Date(new Date().setDate(new Date().getDate() + 90))
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <p className="text-sm text-red-500">{fields.date.errors}</p>
                            </div>

                            <div>
                                <div>
                                    <Label>Invoice Due</Label>
                                </div>
                                <Select name={fields.dueDate.name} key={fields.dueDate.key} defaultValue={fields.dueDate.initialValue}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select due date"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">Due on Receipt</SelectItem>
                                        <SelectItem value="15">15 Days</SelectItem>
                                        <SelectItem value="30">30 Days</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-red-500">{fields.dueDate.errors}</p>
                            </div>

                        </div>

                        <div className="mb-6">
                            <div className="grid grid-cols-14 gap-3 mb-2 font-medium text-sm">
                                <p className="col-span-4">Description</p>
                                <p className="col-span-2">Quantity</p>
                                <p className="col-span-2">Rate</p>
                                <p className="col-span-2">Discount (%)</p>
                                <p className="col-span-2">Tax (%)</p>
                                <p className="col-span-2">Amount</p>
                            </div>

                            <div className="grid grid-cols-14 gap-3 mb-4 items-start">
                                <div className="col-span-4">
                                    <Textarea 
                                        name={fields.invoiceItemDescription.name} 
                                        key={fields.invoiceItemDescription.key}
                                        defaultValue={fields.invoiceItemDescription.initialValue}
                                        placeholder="Item name and Description"
                                        className="min-h-[40px]"
                                    />
                                    <p className="text-sm text-red-500">{fields.invoiceItemDescription.errors}</p>
                                </div>
                                <div className="col-span-2">
                                    <Input 
                                        name={fields.invoiceItemQuantity.name} 
                                        key={fields.invoiceItemQuantity.key}
                                        type="number" 
                                        placeholder="0"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                    />
                                    <p className="text-sm text-red-500">{fields.invoiceItemQuantity.errors}</p>
                                </div>
                                <div className="col-span-2">
                                    <Input
                                        name={fields.invoiceItemRate.name} 
                                        key={fields.invoiceItemRate.key}
                                        type="number" 
                                        placeholder="0"
                                        value={rate}
                                        onChange={(e) => setRate(e.target.value)}
                                    />
                                    <p className="text-sm text-red-500">{fields.invoiceItemRate.errors}</p>
                                </div>
                                <div className="col-span-2">
                                    <Input 
                                        name={fields.invoiceItemDiscount.name} 
                                        key={fields.invoiceItemDiscount.key}
                                        type="number" 
                                        placeholder="0"
                                        value={discount}
                                        onChange={(e) => setDiscount(e.target.value)}
                                    />
                                    <p className="text-sm text-red-500">{fields.invoiceItemDiscount.errors}</p>
                                </div>
                                <div className="col-span-2">
                                    <Input 
                                        name={fields.invoiceItemTax.name} 
                                        key={fields.invoiceItemTax.key}
                                        type="number" 
                                        placeholder="0"
                                        value={tax}
                                        onChange={(e) => setTax(e.target.value)}
                                    />
                                    <p className="text-sm text-red-500">{fields.invoiceItemTax.errors}</p>
                                </div>
                                <div className="col-span-2">
                                    <Input
                                        type="number" 
                                        placeholder="0"
                                        disabled
                                        className="bg-gray-50"
                                        value={amount.toFixed(2)}
                                    />
                                </div>
                            </div>

                        </div>

                        <div className="flex justify-end mb-6">
                            <div className="w-1/3">
                                <div className="flex justify-between py-2">
                                <span>Subtotal (After Discount)</span>
                                <span>
                                    ₹{(
                                        (parseFloat(quantity) || 0) * (parseFloat(rate) || 0) -
                                        (((parseFloat(quantity) || 0) * (parseFloat(rate) || 0)) * (parseFloat(discount) || 0)) / 100
                                    ).toFixed(2)}
                                </span>
                                </div>
                                <div className="flex justify-between py-2 border-t">
                                <span>Total (INR)</span>
                                <span className="font-medium underline underline-offset-2">
                                    ₹{amount.toFixed(2)}
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
                                placeholder="Add your Note/s right here..."/>
                            <p className="text-sm text-red-500">{fields.note.errors}</p>
                        </div>

                        <div className="flex items-center justify-end mt-6">
                            <div className="cursor-pointer">
                                <Submitbutton text="Send Invoice to Client"/>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}