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
  // { label: "Listing Status", key: "listing_status" },
  { label: "Star Rating", key: "star_rating" },
  { label: "Property Build", key: "property_build" },
  { label: "Accepting Booking Since", key: "accepting_booking_since", type: "date" },
  // { label: "Booking Status", key: "booking_status" },
  { label: "Locality", key: "locality" },
  { label: "Description", key: "description" },
];

const BasicInfo = () => {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [localities, setLocalities] = useState<{ _id: string; title: string }[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<{ id: string; type: string }[]>([]);
  const [formData, setFormData] = useState<any>({
    property_status: "1",
    listing_status: "2",
  });

  const { propertyId, userId, setPropertyTile } = useAppContext()


  useEffect(() => {
    async function fetchPropertyTypes() {
      try {
        const res = await fetch("/api/propertytype/get");
        const response = await res.json();
        if (response.status && Array.isArray(response.data)) {
          setPropertyTypes(response.data);
        } else {
          toast.error("Failed to load property types");
        }
      } catch {
        toast.error("Error loading property types");
      }
    }
    fetchPropertyTypes();
  }, []);

  useEffect(() => {
    if (!propertyId) return;

    // (async function () {
    //  try {
    //    const historyRes = await fetch(`/api/history/info/pending?propertyId=${propertyId}`);
    //   const result = await historyRes.json();
    //   console.log(result);
      
    //  } catch (error) {
    //   console.log(error);
      
    //  }


    // })()
    async function fetchProperty() {
      try {
        setLoading(true);
        const res = await fetch(`/api/property/get?propertyId=${propertyId}`);
        const result = await res.json();
        if (result.status) {
          setUser(result.data || []);
          setFormData({
            ...result.data,
            property_status: result.data.property_status || "1",
            listing_status: result.data.listing_status || "2",
            booking_status: result.data.booking_status || "1",
            locality: result.data.locality || "",
          });
          setPropertyTile(result?.data?.property_name)
        }
      } catch {
        toast.error("Failed to fetch property");
      } finally {
        setLoading(false);
      }
    }
    fetchProperty();
  }, [propertyId]);

  //   useEffect(() => {
  //   if (!propertyId) return;

  //   async function fetchProperty() {
  //     try {
  //       setLoading(true);

  //       const historyRes = await fetch(`/api/history/info/pending?propertyId=${propertyId}`);
  //       const historyData = await historyRes.json();

  //       console.log("History data:", historyData); 

  //       if (historyData.status && historyData.data) {
  //         toast("Pending approval changes loaded");
  //         setUser(historyData.data.newData || []);
  //         setFormData({
  //           ...historyData.data.newData,
  //           property_status: historyData.data.newData.property_status || "1",
  //           listing_status: historyData.data.newData.listing_status || "2",
  //           booking_status: historyData.data.newData.booking_status || "1",
  //           locality: historyData.data.newData.locality || "",
  //         });
  //       } else {
  //         console.log("Fetching main property...");
  //         const res = await fetch(`/api/property/get?propertyId=${propertyId}`);
  //         const result = await res.json();
  //         console.log("Property data:", result); 
  //         if (result.status) {
  //           setUser(result.data || []);
  //           setFormData({
  //             ...result.data,
  //             property_status: result.data.property_status || "1",
  //             listing_status: result.data.listing_status || "2",
  //             booking_status: result.data.booking_status || "1",
  //             locality: result.data.locality || "",
  //           });
  //         } else {
  //           toast.error("Failed to fetch property");
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error fetching property:", error);
  //       toast.error("Error fetching property data");
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   fetchProperty();
  // }, [propertyId]);

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
  };

  // const handleSave = async () => {
  //   try {
  //     const keysToSend = inputs.map((input) => input.key);
  //     const filteredPayload: Record<string, any> = {};
  //     keysToSend.forEach((key) => {
  //       if (formData.hasOwnProperty(key)) filteredPayload[key] = formData[key];
  //     });

  //     filteredPayload.property_status = String(filteredPayload.property_status);
  //     filteredPayload.listing_status = String(filteredPayload.listing_status);
  //     filteredPayload.booking_status = String(filteredPayload.booking_status);

  //     const res = await fetch(`/api/property/update/${propertyId}`, {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(filteredPayload),
  //     });

  //     const result = await res.json();
  //     if (result.status) {
  //       setUser(result.data);
  //       setIsEditing(false);
  //       toast.success("Property updated successfully");
  //     } else {
  //       toast.error(result.error || "Update failed");
  //     }
  //   } catch {
  //     toast.error("An error occurred while saving");
  //   }
  // };

  const handleSave = async () => {
    try {
      const keysToSend = inputs.map((input) => input.key);
      const filteredPayload: Record<string, any> = {};
      keysToSend.forEach((key) => {
        if (formData.hasOwnProperty(key)) filteredPayload[key] = formData[key];
      });

      const res = await fetch(`/api/history/info/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          userId,
          newData: filteredPayload,
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

  return (
    <>

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                  {propertyTypes.map((type) => (
                                    <SelectItem key={type.id} value={type.type}>
                                      {type.type}
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
                                value={formData[key]}
                                onValueChange={(v) => handleChange(key, v)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">
                                    Property Not Verified
                                  </SelectItem>
                                  <SelectItem value="2">
                                    Property Verified
                                  </SelectItem>
                                  <SelectItem value="3">Suspended</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : key === "listing_status" ||
                              key === "booking_status" ? (
                              <Select
                                value={formData[key]}
                                onValueChange={(v) => handleChange(key, v)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="2">Active</SelectItem>
                                  <SelectItem value="1">Inactive</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : key === "description" ? (
                              <Textarea
                                value={formData[key] || ""}
                                onChange={(e) =>
                                  handleChange(key, e.target.value)
                                }
                                rows={4}
                              />
                            ) : type === "date" ? (
                              <Input
                                type="date"
                                value={formData[key] || ""}
                                onChange={(e) =>
                                  handleChange(key, e.target.value)
                                }
                              />
                            ) : (
                              <Input
                                type="text"
                                value={formData[key] || ""}
                                onChange={(e) =>
                                  handleChange(key, e.target.value)
                                }
                              />
                            )
                          ) : (
                            <div className="text-sm text-gray-800 border rounded-md px-3 py-2 bg-gray-50">
                              {key === "property_status"
                                ? formData[key] === "1"
                                  ? "Property Not Verified"
                                  : formData[key] === "2"
                                    ? "Property Verified"
                                    : "Suspended"
                                : key === "listing_status" ||
                                  key === "booking_status"
                                  ? formData[key] === "2"
                                    ? "Active"
                                    : "Inactive"
                                  : key === "locality"
                                    ? localities.find(
                                      (loc) => loc._id === formData[key]
                                    )?.title || "-"
                                    : formData[key] || "-"}
                            </div>
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
                      onClick={handleSave}
                      className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                    >
                      <Save size={16} /> Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFormData(user);
                        setIsEditing(false);
                      }}
                      className="flex items-center gap-2"
                    >
                      <X size={16} /> Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-gray-900 hover:bg-gray-800 flex items-center gap-2"
                  >
                    <Edit3 size={16} /> Edit
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default BasicInfo;
