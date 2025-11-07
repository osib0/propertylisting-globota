'use client'
import { useAppContext } from "@/app/contextapi"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuGroup, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronsUpDown, Eye, Search } from "lucide-react"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"
import Profile from "./profile"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"


const Header = () => {
    const { propertyTitle, propertyId } = useAppContext()
    return (
        <header className="bg-[#003b95] w-full text-white p-5 gap-2 border-b flex items-center justify-between h-[85px]">
            <div className="flex items-center gap-1">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild className="w-fit cursor-pointer hover:bg-white/10 text-white">
                        <Button variant="ghost" className="flex items-center gap-1 h-fit hover:text-white">
                            <h1 className="text-xl capitalize font-normal">{propertyTitle}</h1>
                            <span className="text-[11px] border border-white/25 p-1">{propertyId}</span>
                            <ChevronsUpDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                    </DropdownMenuContent>
                </DropdownMenu>
                <Tooltip delayDuration={500}>
                    <TooltipTrigger asChild>
                        <Eye className="cursor-pointer m-0" size={20} />
                    </TooltipTrigger>
                  <TooltipContent>
                        <p>view youre property's listing on GlobOTA.com</p>
                    </TooltipContent>
                </Tooltip>
            </div>
            <div className="flex gap-2 items-center">
                <form action="">
                    <InputGroup className="border border-white/10 bg-white/20 shadow-none">
                        <InputGroupInput className="text-white placeholder:text-white" placeholder="Search..." />
                        <InputGroupAddon className="text-white">
                            <Search />
                        </InputGroupAddon>
                    </InputGroup>
                </form>
                <Profile />
                <SidebarTrigger />
            </div>
        </header>
    )
}

export default Header