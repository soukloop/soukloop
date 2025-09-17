import AuthPopup from "../signin/components/auth-popup"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        {/* <h1 className="text-2xl font-bold mb-4">Demo Page</h1>
        <p className="text-gray-600">The auth popup will appear automatically</p> */}
      </div>
      <AuthPopup />
    </main>
  )
}
