

import { CustomSidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import SidebartriggerCompoent from "./_compoents/sidebartrigger";



export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main>
            <SidebarProvider>
                <CustomSidebar />
                <SidebartriggerCompoent />
                {children}
            </SidebarProvider>
        </main>


    );
}
