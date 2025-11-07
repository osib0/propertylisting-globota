import { CustomSidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
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
                {children}
            </SidebarProvider>
        </main>


    );
}
