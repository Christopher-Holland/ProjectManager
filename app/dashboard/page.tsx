import Navbar from "../components/navbar";


export default function Dashboard() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-200 to-gray-400">
            <Navbar currentPath="/dashboard" />
            <main className="pt-16">
                <h1 className="text-2xl font-bold text-gray-900 px-4 text-3xl">Dashboard</h1>
            </main>        
        </div>
    )
}
