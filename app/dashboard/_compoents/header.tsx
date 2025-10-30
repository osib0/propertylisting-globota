"use client";
import { useAppContext } from "@/app/contextapi";
import { Badge } from "@/components/ui/badge";

interface propType {
    title: string;
    description: string;
}

const Header = ({ title, description }: propType) => {
    const { isAprove } = useAppContext();

    return (
        <div className="border-b bg-white py-4 px-6 sticky top-0 z-20 flex flex-col gap-1">
            <div className="flex items-center w-fit gap-2">
                <h2 className="text-2xl font-semibold">{title}</h2>

                {!isAprove &&
                    <Badge variant="destructive">
                        Pending Approval
                    </Badge>
                }
            </div>

            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
};

export default Header;
