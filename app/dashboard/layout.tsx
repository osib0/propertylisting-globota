

import { CustomSidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";



export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main>
            <SidebarProvider>
                <CustomSidebar />
                {children}
            </SidebarProvider>
        </main>


    );
}
