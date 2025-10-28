"use client";

import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Landmark, Mail, Phone, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";


const ownerSchema = z.object({
    ownerName: z.string().min(1, "Owner name is required"),
    ownerPhone: z.string().optional(),
    ownerAltPhone: z.string().optional(),
    ownerEmail: z.string().email("Invalid email").optional(),
    ownerCompany: z.string().optional(),
    ownerGstin: z.string().optional(),
    ownerWebsite: z.string().optional()
});

type OwnerFormValues = z.infer<typeof ownerSchema>;

interface OwnerDetailsProps {
    shareData: any;
    setShareData: (value: any) => void;
    handleNext?: () => void;
}

const OwnerDetails: React.FC<OwnerDetailsProps> = ({
    shareData,
    setShareData,
    handleNext,
}) => {
    const [loading, setLoading] = useState(false);

    const form = useForm<OwnerFormValues>({
        resolver: zodResolver(ownerSchema),
        defaultValues: {
            ownerName: "",
            ownerPhone: "",
            ownerAltPhone: "",
            ownerEmail: "",
            ownerCompany: "",
            ownerGstin: "",
            ownerWebsite: "",
        },
    });

    // Load existing owner data if available
    useEffect(() => {
        if (shareData?.owner_details) {
            form.reset(shareData.owner_details);
        }
    }, [form]);

    // Update shared data when form changes
    useEffect(() => {
        const subscription = form.watch((values) => {
            setShareData((prev: any) => ({
                ...prev,
                owner_details: values,
            }));
        });
        return () => subscription.unsubscribe();
    }, [form.watch, setShareData]);

    const fields = [
        { name: "ownerName", label: "Owner Name *", placeholder: "Full legal name" },
        { name: "ownerPhone", label: "Phone", icon: <Phone className="w-4 h-4 text-primary" />, placeholder: "+91 98xxxxxx" },
        { name: "ownerAltPhone", label: "Alt. Phone", placeholder: "+91 9xxxxxxx" },
        { name: "ownerEmail", label: "Email", icon: <Mail className="w-4 h-4 text-primary" />, placeholder: "owner@email.com" },
        { name: "ownerCompany", label: "Company (optional)", icon: <Landmark className="w-4 h-4 text-primary" />, placeholder: "Legal entity / trade name" },
        { name: "ownerGstin", label: "GSTIN (optional)", placeholder: "15-digit GSTIN" },
        { name: "ownerWebsite", label: "Website (optional)", icon: <Globe className="w-4 h-4 text-primary" />, placeholder: "https://" },
    ];

    const onSubmit = async (values: OwnerFormValues) => {
        try {
            setLoading(true);

            // merge with parent shared data
            const payload = { ...shareData, owner_details: values };

            const res = await fetch("/api/listproperty/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to save data");
            const result = await res.json();
            if (result.success) {
                toast.success("details saved successfully");
            }
            handleNext?.();
        } catch (err: any) {
            console.error("Error:", err);
            toast.error("Failed to save details");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen w-full">
            {/* Header */}
            <div className="border-b bg-white py-4 px-6 sticky top-0 z-20">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Owner / Host Details</h2>
                    <Badge variant="secondary">KYC & Contacts</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                    Provide owner’s verified contact details for communication and KYC.
                </p>
            </div>

            {/* Form */}
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex-1 p-6 max-w-5xl mx-auto"
                >
                    <Card className="px-4">
                        <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {fields.map(({ name, label, icon, placeholder }) => (
                                <FormField
                                    key={name}
                                    control={form.control}
                                    name={name as keyof OwnerFormValues}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1 text-sm font-medium">
                                                {icon}
                                                {label}
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder={placeholder} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </CardContent>
                        <Button
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : <>Submit</>}
                        </Button>
                    </Card>

                </form>
            </Form>
        </div>
    );
};

export default OwnerDetails;
