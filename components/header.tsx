'use client'
import { useAppContext } from "@/app/contextapi"
import { SidebarTrigger } from "@/components/ui/sidebar"

const Header = () => {
    const {propertyTitle,propertyId} = useAppContext()
    return (
        <header className="bg-white w-full p-5 border-b flex justify-between">
            <div>
                <h1 className="text-xl">{propertyTitle}</h1>
                <span className="uppercase text-xs mt-4">property id:{propertyId}</span>
            </div>
            <SidebarTrigger />
        </header>
    )
}

export default Header