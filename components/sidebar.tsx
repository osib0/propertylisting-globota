"use client";

import {  useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/app/contextapi";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  Home,
  MapPin,
  Wifi,
  Image as ImageIcon,
  ListFilter,
  Bed,
  User,
} from "lucide-react";

import logoIcon from "@/public/logo-removebg-preview.png";


const menuItems = [
  { label: "Basic Info", href: "/dashboard/basic-info" },
  { label: "Location", href: "/dashboard/location" },
  { label: "Property Amenities", href: "/dashboard/property-amenities" },
  { label: "Property Photos", href: "/dashboard/property-photos" },
  { label: "Rooms", href: "/dashboard/rooms" },
  { label: "Room Photos", href: "/dashboard/room-photos" },
  { label: "Inventory", href: "/dashboard/inventory" },
];

const getIcon = (label: string) => {
  const map: Record<string, any> = {
    "Basic Info": Home,
    Location: MapPin,
    "Property Amenities": Wifi,
    "Property Photos": ImageIcon,
    Rooms: ListFilter,
    "Room Photos": Bed,
    Inventory: User,
  };
  return map[label] || Home;
};

export function CustomSidebar() {
  const { isAprove } = useAppContext();
  const { data: session } = useSession();
  const [open, setOpen] = useState<boolean>(false);


  if (!session?.user) return null;
  if (!isAprove) return null;

  return (
    <>
      <Sidebar collapsible="offcanvas" className="bg-transparent p-0">
        <SidebarContent className="bg-[#4360ed] text-white px-3 flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-center bg-[#003b95] h-[85px]">
              <Image
                src={logoIcon}
                alt="icon"
                width={500}
                height={500}
                className="mb-2 object-cover w-96 h-[76px]"
              />
              {/* <Badge className="bg-green-100 text-green-700">Approved</Badge> */}
            </div>
            <SidebarGroup>
              <SidebarGroupLabel className="text-white">Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => {
                    const Icon = getIcon(item.label);
                    return (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton
                          asChild
                          className={cn(
                            "flex items-center gap-3 py-2 text-sm font-medium transition-all  hover:text-black hover:bg-gray-50"
                          )}
                        >
                          <Link
                            href={item.href}
                            className="flex items-center gap-3 w-full"
                          >
                            <Icon size={18} />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        </SidebarContent>
      </Sidebar>
    </>
  );
}
