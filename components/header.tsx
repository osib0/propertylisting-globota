import { SidebarTrigger } from "@/components/ui/sidebar"

const Header = ({ title, propertyId }: { title: string, propertyId: string }) => {
    return (
        <header className="bg-white w-full p-5 border-b flex justify-between">
            <div>
                <h1 className="text-xl">{title}</h1>
                <span className="uppercase text-xs mt-4">property id:{propertyId}</span>
            </div>
            <SidebarTrigger />
        </header>
    )
}

export default Header