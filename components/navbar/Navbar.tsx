export default function Navbar() {
  return (
    <nav className="w-full border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="text-xl font-bold text-gray-900">
          Campus Flow AI
        </div>

        <div className="flex items-center gap-4">
          <button className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            Login
          </button>

          <button className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
}