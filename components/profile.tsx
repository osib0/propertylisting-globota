'use client'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuGroup, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { BellIcon, CreditCardIcon, LogOutIcon, SettingsIcon, User, UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { signOut } from "next-auth/react";


const listItems = [
    {
        icon: UserIcon,
        property: 'Profile',
        key: 'profile'
    },
    {
        icon: SettingsIcon,
        property: 'Settings',
        key: 'settings'
    },
    {
        icon: CreditCardIcon,
        property: 'Billing',
        key: 'billing'
    },
    {
        icon: BellIcon,
        property: 'Notifications',
        key: 'notifications'
    },
    {
        icon: LogOutIcon,
        property: 'Sign Out',
        key: 'sign-out'
    }
]


const Profile = () => {
    const [open, setOpen] = useState<boolean>(false);

    function menuHandler(value: string) {
        console.log(value);
        switch (value) {
            case 'sign-out':
                setOpen(true)
                break;

            default:
                break;
        }

    }
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant='outline' size='icon' className='overflow-hidden rounded-full bg-transparent cursor-pointer'>
                        {/* <img src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png' alt='Hallie Richards' /> */}
                        <User size={80} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-56'>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuGroup>
                        {listItems.map((item, index) => (
                            <DropdownMenuItem key={index} onClick={() => menuHandler(item.key)}>
                                <item.icon />
                                <span className='text-popover-foreground'>{item.property}</span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
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
    )
}

export default Profile