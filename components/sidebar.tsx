"use client";

import { useEffect, useState } from "react";
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
  CupSoda,
  User,
  LogOut,
} from "lucide-react";

import logoIcon from "@/app/favicon.ico";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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
      <Sidebar collapsible="offcanvas" className="bg-white">
        <SidebarContent className="bg-white px-3 flex flex-col justify-between h-full">
          <div>
            {/* Logo + Status */}
            <div className="flex justify-between items-center">
              <Image
                src={logoIcon}
                alt="icon"
                width={50}
                height={50}
                className="bg-white mb-2"
              />
              <Badge className="bg-green-100 text-green-700">Approved</Badge>
            </div>

            {/* Menu */}
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => {
                    const Icon = getIcon(item.label);
                    return (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton
                          asChild
                          className={cn(
                            "flex items-center gap-3 py-2 text-sm font-medium transition-all text-gray-600 hover:text-black hover:bg-gray-50"
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

          {/* Logout */}
          <Button
            onClick={() => setOpen(true)}
            className="mb-5"
            variant={"secondary"}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </Button>
        </SidebarContent>
      </Sidebar>

      {/* Logout Dialog */}
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
                setOpen(false);
                signOut({ callbackUrl: "/sign-up" });
              }}
            >
              Yes, Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
