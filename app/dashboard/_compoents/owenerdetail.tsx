"use client";

import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Landmark, Mail, Phone, ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import Header from "./header";
import { useAppContext } from "@/app/contextapi";

const ownerSchema = z.object({
  ownerName: z
    .string()
    .min(3, "Owner name must be at least 3 characters")
    .max(50, "Owner name too long"),
  ownerPhone: z
    .string()
    .min(10, "Phone must be 10 digits")
    .max(10, "Phone must be 10 digits")
    .regex(/^[0-9]{10}$/, "Phone must contain only numbers"),
  ownerAltPhone: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9]{10}$/.test(val), {
      message: "Alternate phone must be 10 digits",
    }),
  ownerEmail: z
    .string()
    .email("Invalid email address"),
  ownerCompany: z.string().optional(),
  ownerGstin: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9A-Z]{15}$/.test(val), {
      message: "Invalid GSTIN format",
    }),
  ownerWebsite: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || val.startsWith("https://"), {
      message: "Website must start with https://",
    }),
});

type OwnerFormValues = z.infer<typeof ownerSchema>;

interface OwnerDetailsProps {
  shareData: any;
  setShareData: (value: any) => void;
  handleNext?: () => void;
  defaultData: any;
}

const OwnerDetails: React.FC<OwnerDetailsProps> = ({
  shareData,
  setShareData,
  handleNext,
  defaultData,
}) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const { setTab, getListing } = useAppContext();

  const form = useForm<OwnerFormValues>({
    resolver: zodResolver(ownerSchema),
    mode: "onChange",
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

  useEffect(() => {
    if (defaultData) {
      form.reset(defaultData);
    } else if (shareData?.owner_details) {
      form.reset(shareData.owner_details);
    }
  }, [defaultData]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      setShareData((prev: any) => ({
        ...prev,
        ownerId: session?.user?.id,
        owner_details: values,
      }));
    });
    return () => subscription.unsubscribe();
  }, [form.watch, setShareData, session?.user?.id]);

  const fields = [
    { name: "ownerName", label: "Owner Name *", placeholder: "Full legal name" },
    { name: "ownerPhone", label: "Phone *", icon: <Phone className="w-4 h-4 text-primary" />, placeholder: "10-digit number" },
    { name: "ownerAltPhone", label: "Alt. Phone", placeholder: "10-digit number" },
    { name: "ownerEmail", label: "Email", icon: <Mail className="w-4 h-4 text-primary" />, placeholder: "owner@email.com" },
    { name: "ownerCompany", label: "Company (optional)", icon: <Landmark className="w-4 h-4 text-primary" />, placeholder: "Legal entity / trade name" },
    { name: "ownerGstin", label: "GSTIN (optional)", placeholder: "15-digit GSTIN" },
    { name: "ownerWebsite", label: "Website (optional)", icon: <Globe className="w-4 h-4 text-primary" />, placeholder: "https://" },
  ];

  const onSubmit = async (values: OwnerFormValues) => {
    console.log(shareData, 'shareData');
    if (!session?.user?.id) {
      console.log('no id found');
      return
    }

    try {
      setLoading(true);
      const payload = { ...shareData, owner_details: values };
      const res = await fetch(`/api/listproperty/add?ownerId=${session?.user?.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save data");
      const result = await res.json();

      if (result.success) {
        toast.success("Details saved successfully");
      }
      getListing()
    } catch (err: any) {
      console.error("Error:", err);
      toast.error("Failed to save details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header
        status={form.formState.isValid}
        title="Owner / Host Details"
        description="Provide owner’s verified contact details for communication and KYC."
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 px-4 sm:px-6 md:px-10 max-w-6xl mx-auto w-full"
        >
          <Card className="border-0 shadow-none px-4 rounded-none">
            <h1 className="text-xl font-normal">Fill Your Details</h1>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {fields.map(({ name, label, icon, placeholder }) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name as keyof OwnerFormValues}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1 text-sm font-medium text-gray-700">
                          {icon}
                          {label}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={placeholder}
                            className="h-10 focus:ring-2 focus:ring-primary/50"
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <div className="flex justify-end pt-6 border-t gap-2">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => setTab("Documents")}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={!form.formState.isValid || loading}
                  className="flex items-center gap-2 min-w-[140px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default OwnerDetails;
