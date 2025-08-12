export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <nav className="bg-gray-800 text-white p-4">
        <h1 className="text-xl font-bold">CrackCheck Dashboard</h1>
      </nav>
      <main className="p-6">
        {children}
      </main>
    </div>
  )
}