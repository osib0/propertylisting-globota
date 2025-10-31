import { CustomSidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import SidebartriggerCompoent from "./_compoents/sidebartrigger";
// import Approve from "./_compoents/aprove";



export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="bg-[#fafafa]">
            {/* <Approve/> */}
            <SidebarProvider>
                <CustomSidebar />
                <SidebartriggerCompoent />
                {children}
            </SidebarProvider>
        </main>


    );
}
