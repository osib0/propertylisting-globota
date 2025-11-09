import { CustomSidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";



export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="bg-[#fafafa]">
            <SidebarProvider>
                <CustomSidebar />
                {children}
            </SidebarProvider>
        </main>


    );
}
