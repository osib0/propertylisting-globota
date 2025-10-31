"use client";

import { Suspense, useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Save } from "lucide-react";
import { useAppContext } from "@/app/contextapi";
import Header from "./header";


const formSchema = z.object({
  propertyTitle: z.string().min(1, "Property name is required"),
  propertyType: z.string().min(1, "Property type is required"),
  email: z.string().email("Invalid email").optional(),
  propertyBuildYear: z.string().optional(),
  bookingSinceYear: z.string().optional(),
  description: z.string().min(1, "Description is required"),
});

export default function PropertyDetails({ setShareData, shareData, defaultData }: any) {
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { setTab } = useAppContext()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      propertyTitle: defaultData?.propertyTitle || "",
      propertyType: defaultData?.propertyType || "",
      email: defaultData?.email || "",
      propertyBuildYear: defaultData?.propertyBuildYear || "",
      bookingSinceYear: defaultData?.bookingSinceYear || "",
      description: defaultData?.description || "",
    },
  });

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/propertytype/get");
      const result = await res.json();
      setPropertyTypes(result?.data || []);
    })();
  }, []);

  useEffect(() => {
    if (shareData?.property_detail) {
      form.reset(shareData.property_detail);
    }
  }, []);

useEffect(() => {
  if (defaultData && !shareData?.property_detail) {
    form.reset(defaultData);
  }
}, [defaultData, shareData, form]);

useEffect(() => {
  const subscription = form.watch((values) => {
    setShareData((prev: any) => ({
      ...prev,
      property_detail: values,
    }));
  });
  return () => subscription.unsubscribe();
}, [form, setShareData]);





  const handleNext = async () => {
    setLoading(true);
    const valid = await form.trigger();
    if (valid) {
      setTab('Location')
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col w-full">
      <Header status={form.formState.isValid} title="Property Details" description="Tell us more about your property before we move to the next step." />
      <div className="flex-1 overflow-y-auto p-6">
        <Card className="p-6 w-full max-w-4xl mx-auto border-0 rounded-xl shadow-none bg-white">
          <h1 className="text-xl font-normal">Fill Property Details</h1>
          <Suspense fallback={<h1>Loading</h1>}>
            <Form {...form}>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Property Title */}
                <FormField
                  control={form.control}
                  name="propertyTitle"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel>
                        Property Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Royal Heritage Desert Camp" {...field} />
                      </FormControl>
                      <FormMessage className="-bottom-5 absolute text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel>
                        Property Type <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || defaultData?.propertyType || ""}>
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue placeholder="Select property type..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {propertyTypes.map((type) => (
                            <SelectItem key={type.type} value={type.type}>
                              {type.type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="-bottom-5 absolute text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="example@gmail.com" {...field} />
                      </FormControl>
                      <FormMessage className="-bottom-5 absolute text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="propertyBuildYear"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel>Property Build Year</FormLabel>
                      <FormControl>
                        <Input placeholder="2025" {...field} />
                      </FormControl>
                      <FormMessage className="-bottom-5 absolute text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bookingSinceYear"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel>Booking Since</FormLabel>
                      <FormControl>
                        <Input placeholder="2025" {...field} />
                      </FormControl>
                      <FormMessage className="-bottom-5 absolute text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>
                        Description <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Enter property description..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="-bottom-5 absolute text-xs" />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </Suspense>
        </Card>
      </div>
      <div className="border-t bg-white p-4 sticky bottom-0 z-30 flex justify-end items-center gap-2">
        <Button onClick={handleNext} disabled={loading} className="flex items-center gap-2">
          {loading ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" /> Processing...
            </>
          ) : (
            <>
              Next Step <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
