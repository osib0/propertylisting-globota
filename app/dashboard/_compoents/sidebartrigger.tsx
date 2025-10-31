'use client'
import { useAppContext } from "@/app/contextapi"
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react";

const SidebartriggerCompoent = () => {
    const { isAprove } = useAppContext();
    const [open, setOpen] = useState<boolean>(false);


    if (!isAprove) {
        return (
            <>
                <Button
                    onClick={() => setOpen(true)}
                    className="mb-5 fixed z-50 right-5 top-5"
                    variant={'secondary'}
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </Button>
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


}

export default SidebartriggerCompoent