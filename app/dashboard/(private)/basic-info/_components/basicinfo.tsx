"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit3, Save, X } from "lucide-react";
import { useAppContext } from "@/app/contextapi";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface InputField {
  label: string;
  key: string;
  type?: string;
}

const inputs: InputField[] = [
  { label: "Property Name", key: "property_name" },
  { label: "Display Name", key: "display_name" },
  { label: "Property Type", key: "property_type" },
  { label: "Email", key: "email" },
  { label: "Phone", key: "phone" },
  { label: "Landline Number", key: "landline_number" },
  { label: "Property Status", key: "property_status" },
  { label: "Star Rating", key: "star_rating" },
  { label: "Property Build", key: "property_build" },
  { label: "Accepting Booking Since", key: "accepting_booking_since", type: "date" },
  { label: "Locality", key: "locality" },
  { label: "Description", key: "description" },
];

const BasicInfoSchema = z.object({
  property_name: z.string().min(3, "Property name is required"),
  display_name: z.string().min(3, "Display name is required"),
  property_type: z.string().min(1, "Property type is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number too long"),
  landline_number: z.string().optional(),
  property_status: z.string().min(1, "Select property status"),
  star_rating: z.string().optional(),
  property_build: z.string().optional(),
  accepting_booking_since: z.string().optional(),
  locality: z.string().min(1, "Select locality"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type BasicInfoForm = z.infer<typeof BasicInfoSchema>;

const BasicInfo = () => {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [localities, setLocalities] = useState<{ _id: string; title: string }[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<{ id: string; type: string }[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});


  const { propertyId, userId, setPropertyTile } = useAppContext();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BasicInfoForm>({
    mode:'onSubmit',
    resolver: zodResolver(BasicInfoSchema),
  });

  useEffect(() => {
    async function fetchPropertyTypes() {
      try {
        const res = await fetch("/api/propertytype/get");
        const response = await res.json();
        if (response.status && Array.isArray(response.data)) {
          setPropertyTypes(response.data ?? []);
        } else {
          toast.error("Failed to load property types");
        }
      } catch {
        toast.error("Error loading property types");
      }
    }
    fetchPropertyTypes();
  }, []);

  async function fetchProperty() {
    try {
      setLoading(true);

      const pendingRes = await fetch(
        `/api/history/info/pending?propertyId=${propertyId}&userId=${userId}&section=basicInfo`
      );
      const pendingData = await pendingRes.json();
      if (pendingData.status) {
        toast("You have a pending edit request (awaiting admin approval)");
        return;
      }

      const res = await fetch(`/api/property/get?propertyId=${propertyId}`);
      const result = await res.json();
      if (result.status) {
        setUser(result.data || []);
        setFormData(result?.data ?? {});
        Object.keys(result.data).forEach((key) =>
          setValue(key as keyof BasicInfoForm, result.data[key])
        );
        setPropertyTile(result?.data?.property_name);
      }
    } catch {
      toast.error("Failed to fetch property info");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (propertyId) fetchProperty();
  }, [propertyId]);

  useEffect(() => {
    async function fetchLocalities() {
      try {
        const res = await fetch("/api/locality/get");
        const data = await res.json();
        if (data.status && Array.isArray(data.data)) {
          setLocalities(data.data);
        } else {
          toast.error("Failed to load localities");
        }
      } catch {
        toast.error("Error fetching localities");
      }
    }
    fetchLocalities();
  }, []);

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    setValue(name as keyof BasicInfoForm, value);
  };

  const onSubmit = async (data: BasicInfoForm) => {
    try {
      const res = await fetch(`/api/history/info/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          userId,
          section: "basicInfo",
          newData: data,
        }),
      });

      const result = await res.json();
      if (result.status) {
        toast.success("Changes sent for approval");
        setIsEditing(false);
      } else {
        toast.error(result.message || "Failed to submit changes");
      }
    } catch {
      toast.error("An error occurred while saving changes");
    }
  };
  const handleCancel = () => {
    if (user && typeof user === "object") {
      setFormData(user);
    } else {
      setFormData({});
    }
    setIsEditing(false);
  };

  return (
    <div className="max-w-7xl w-full mx-auto bg-white p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Basic Info</h2>
        <p className="text-muted-foreground text-sm">Use basic property information</p>
      </div>
      <Card className="border-0 rounded-2xl shadow-none backdrop-blur-sm">
        <CardHeader className="pb-1 flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            Property Information
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 space-x-6 space-y-1 mx-auto">
              {(loading ? Array.from({ length: inputs.length }) : inputs).map(
                (field, i) => {
                  const { label, key, type }: any = field || {};
                  return (
                    <div key={`${key}-${i}`} className="space-y-2">
                      {loading ? (
                        <>
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-10 w-full rounded-md" />
                        </>
                      ) : (
                        <>
                          <Label className="text-sm text-gray-700">{label}</Label>
                          {isEditing ? (
                            key === "property_type" ? (
                              <Select
                                value={formData[key] || ""}
                                onValueChange={(v) => handleChange(key, v)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Property Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {propertyTypes.map((type, idx) => (
                                    <SelectItem key={idx} value={type.type || ""}>
                                      {type.type || "-"}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : key === "locality" ? (
                              <Select
                                value={formData[key] || ""}
                                onValueChange={(v) => handleChange(key, v)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Locality" />
                                </SelectTrigger>
                                <SelectContent>
                                  {localities.map((loc) => (
                                    <SelectItem key={loc._id} value={loc._id}>
                                      {loc.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : key === "property_status" ? (
                              <Select
                                value={formData[key] || ""}
                                onValueChange={(v) => handleChange(key, v)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">Property Not Verified</SelectItem>
                                  <SelectItem value="2">Property Verified</SelectItem>
                                  <SelectItem value="3">Suspended</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : key === "description" ? (
                              <Textarea
                                value={formData[key] || ""}
                                onChange={(e) => handleChange(key, e.target.value)}
                                rows={4}
                              />
                            ) : type === "date" ? (
                              <Input
                                type="date"
                                value={formData[key] || ""}
                                onChange={(e) => handleChange(key, e.target.value)}
                              />
                            ) : (
                              <Input
                                type="text"
                                {...register(key as keyof BasicInfoForm)}
                                value={formData[key] || ""}
                                onChange={(e) => handleChange(key, e.target.value)}
                              />
                            )
                          ) : (
                            <div className="text-sm text-gray-800 border rounded-md px-3 py-2 bg-gray-50">
                              {formData?.[key] ? String(formData[key]) : "-"}
                            </div>
                          )}

                          {isEditing && errors[key as keyof BasicInfoForm] && (
                            <p className="text-xs text-red-500">
                              {errors[key as keyof BasicInfoForm]?.message as string}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  );
                }
              )}
            </div>

            {!loading && (
              <div className="flex justify-end gap-3 mt-8">
                {isEditing ? (
                  <>
                    <Button
                      type="submit"
                      className="bg-blue-700 hover:bg-blue-800 flex items-center gap-2 cursor-pointer"
                    >
                      <Save size={16} /> Save
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={handleCancel}
                      className="flex items-center gap-2"
                    >
                      <X size={16} /> Cancel
                    </Button>

                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    type="button"
                    className="bg-blue-700 hover:bg-blue-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Edit3 size={16} /> Edit
                  </Button>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BasicInfo;
