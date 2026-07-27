import Link from "next/link";

export default function Navbar() {
  return (
    <nav
      className="
        glass
        sticky
        top-0
        z-40
        w-full
        border-x-0
        border-t-0
        border-[var(--border)]
        rounded-none
      "
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="
            text-xl
            font-bold
            text-[var(--text-primary)]
            transition-colors
            duration-300
          "
        >
          Campus Flow AI
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          {/* Login */}
          <Link
            href="/login"
            className="
              rounded-xl
              px-4
              py-2
              text-sm
              font-medium
              text-[var(--text-secondary)]
              transition-all
              duration-200
              hover:bg-[var(--primary-soft)]
              hover:text-[var(--primary)]
            "
          >
            Login
          </Link>

          {/* Sign Up */}
          <Link
            href="/signup"
            className="
              rounded-xl
              bg-primary
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-[var(--shadow-sm)]
              transition-all
              duration-200
              hover:bg-primary-hover
              hover:shadow-[var(--shadow-md)]
            "
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}