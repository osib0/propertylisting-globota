"use client";
import { useAppContext } from "@/app/contextapi";
import Profile from "@/components/profile";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

interface propType {
    title: string;
    description: string;
    status?: boolean;
}

const Header = ({ title, description, status }: propType) => {
    const { isAprove } = useAppContext();

    return (
        <div className="bg-[#003b95] text-white flex items-center justify-between px-6 py-4 sticky top-0 z-20">
            <div className="flex flex-col gap-1">
                <div className="flex items-center w-fit gap-2">
                    <h2 className="text-2xl font-semibold">{title}</h2>

                    {!isAprove &&
                        <Badge variant="destructive">
                            Pending Approval
                        </Badge>
                    }
                    {status == true && (
                        <Badge className="flex items-center gap-1 bg-green-100 text-green-700 border-green-300">
                            <CheckCircle className="w-4 h-4" /> Completed
                        </Badge>
                    )}
                    {status == false && (
                        <Badge className="flex items-center gap-1 bg-red-100 text-red-700 border-red-300">
                            <XCircle className="w-4 h-4" /> Incomplete
                        </Badge>

                    )}

                </div>
                <p className="text-sm text-gray-200">{description}</p>
            </div>
            <Profile />
        </div>
    );
};

export default Header;
