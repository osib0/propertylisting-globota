

import { CustomSidebar } from "@/components/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";



export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main>
            <SidebarProvider>
                <CustomSidebar />
                 <SidebarTrigger className="fixed z-50 right-5 top-5" />
                {children}
            </SidebarProvider>
        </main>


    );
}
