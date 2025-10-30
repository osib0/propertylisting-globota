'use client'

import { useState } from "react"
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
    LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import logoIcon from '@/app/favicon.ico'
import { useAppContext } from "@/app/contextapi"
import { useSession, signOut } from "next-auth/react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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
    { icon: User, label: "Inventory" },
]

export function CustomSidebar() {
    const { isTab, setTab, isAprove } = useAppContext();
    const { data: session } = useSession();
    const [open, setOpen] = useState<boolean>(false);

    if (!session?.user) {
        return null
    }
    if (!isAprove) {
        return null
    }
    return (
        <>
            <Sidebar collapsible="offcanvas" className="bg-white">
                <SidebarContent className="bg-white px-3 flex flex-col justify-between h-full">
                    <div>
                        <div className="flex justify-between items-center">
                            <Image src={logoIcon} alt="icon" width={50} height={50} className="bg-white mb-2" />
                            <Badge className="bg-green-100 text-zinc-500">Aproved</Badge>
                        </div>
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
                    </div>

                    <Button
                        onClick={() => setOpen(true)}
                        className="mb-5"
                        variant={'secondary'}
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </Button>
                </SidebarContent>
            </Sidebar>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Logout</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to logout?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setOpen(false)
                                signOut({ callbackUrl: "/sign-up" })
                            }}
                        >
                            Yes, Logout
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
