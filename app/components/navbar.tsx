import { BarChart3, Link } from "lucide-react";

export default function Navbar({ currentPath = "/dashboard",
}: {
    currentPath: string;
}) {
    const navigation = [
        { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
        
    ];
    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-gray-200 shadow-md flex justify-between items-center px-4 py-2 h-14">
            <div className="flex gap-4 items-center justify-start text-lg font-semibold">
                Navbar
            </div>
        </nav>
    )
}