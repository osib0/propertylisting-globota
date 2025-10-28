'use client'
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

import {
    Home,
    MapPin,
    Wifi,
    Image as ImageIcon,
    ListFilter,
    Bed,
    CupSoda,
    FileText,
    User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import logoIcon from '@/app/favicon.ico'
import { useAppContext } from "@/app/contextapi"
import { useSession } from "next-auth/react"

const menuItems = [
    { icon: Home, label: "Property Details" },
    { icon: MapPin, label: "Location" },
    { icon: Wifi, label: "Property Amenities" },
    { icon: ImageIcon, label: "Property Photos" },
    { icon: ListFilter, label: "Room Details" },
    { icon: Bed, label: "Sleeping Arrangement" },
    { icon: CupSoda, label: "Room Amenities" },
    { icon: ImageIcon, label: "Room Photos" },
    { icon: FileText, label: "Documents" },
    { icon: User, label: "Owner Details" },
]

export function CustomSidebar() {
    const { isTab, setTab } = useAppContext();
    const { data: session } = useSession();
    if (!session?.user) {
        return null
    }

    return (
        <Sidebar collapsible="icon" className="bg-white">
            <SidebarContent className="bg-white px-3">
                <Image src={logoIcon} alt="icon" width={50} height={50} className="bg-white" />
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => {
                                const Icon = item.icon
                                const isActive = isTab === item.label

                                return (
                                    <SidebarMenuItem key={item.label}>
                                        <SidebarMenuButton
                                            asChild
                                            onClick={() => setTab(item.label)}
                                            className={cn(
                                                "flex items-center gap-3 py-2 text-sm font-medium transition-all",
                                                isActive
                                                    ? "text-black bg-gray-100 border-black"
                                                    : "text-gray-600 hover:text-black hover:bg-gray-50"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 cursor-pointer">
                                                <Icon size={18} />
                                                <span>{item.label}</span>
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
