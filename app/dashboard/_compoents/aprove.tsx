"use client";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

const Approve = () => {
    const { data: session } = useSession();
    console.log(session);
    
    const handleApprove = async () => {
        try {
            const res = await fetch(`/api/property/approve?ownerId=${session?.user?.id}`, {
                method: "POST",
            });
            const data = await res.json();
            console.log(data,'data');
            

            if (data.success) {
                alert("✅ Property approved successfully!");
            } else {
                alert("❌ " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("Internal server error");
        }
    };

    return (
        <Button onClick={handleApprove}>
            Approve
        </Button>
    );
};

export default Approve;
