"use client";

import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
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
import { useAppContext } from "../../contextapi";

const formSchema = z.object({
  propertyTitle: z.string().min(1, "Property name is required"),
  propertyType: z.string().min(1, "Property type is required"),
  email: z.string().email("Invalid email").optional(),
  propertyBuildYear: z.string().optional(),
  bookingSinceYear: z.string().optional(),
  description: z.string().min(1, "Description is required"),
});

export default function PropertyDetails({ setShareData, shareData }: any) {
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { setTab } = useAppContext()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyTitle: "",
      propertyType: "",
      email: "",
      propertyBuildYear: "",
      bookingSinceYear: "",
      description: "",
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
    const subscription = form.watch((values) => {
      const timeout = setTimeout(() => {
        setShareData((prev: any) => ({
          ...prev,
          property_detail: values,
        }));
      }, 400);

      return () => clearTimeout(timeout);
    });
    return () => subscription.unsubscribe();
  }, [form, setShareData]);


  const handleNext = async () => {
    setLoading(true);
    const valid = await form.trigger();
    if (valid) {   
      setLoading(false);
      setTab('location')
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="border-b bg-white py-4 px-6 sticky top-0 z-20 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Property Details</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Tell us more about your property before we move to the next step.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <Card className="p-6 w-full max-w-4xl mx-auto shadow-sm border">
          <Form {...form}>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property Title */}
              <FormField
                control={form.control}
                name="propertyTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Property Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Royal Heritage Desert Camp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Property Type <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="example@gmail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="propertyBuildYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Build Year</FormLabel>
                    <FormControl>
                      <Input placeholder="2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bookingSinceYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Booking Since</FormLabel>
                    <FormControl>
                      <Input placeholder="2025" {...field} />
                    </FormControl>
                    <FormMessage />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </Card>
      </div>
      <div className="border-t bg-white p-4 sticky bottom-0 z-30 flex justify-end items-center">
        {/* <Button variant="outline" className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Draft
        </Button> */}
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
