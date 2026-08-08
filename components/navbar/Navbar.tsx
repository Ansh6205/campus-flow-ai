import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <div
        className="
          mx-auto
          flex
          max-w-7xl
          items-center
          justify-between
          rounded-2xl
          border
          border-[var(--border)]
          bg-[var(--glass-bg)]
          px-5
          py-3
          shadow-[var(--shadow-md)]
          backdrop-blur-xl
          transition-all
          duration-300
        "
      >
        {/* Logo */}

        <Link
          href="/"
          className="
            group
            flex
            items-center
            gap-3
            transition-all
            duration-300
          "
        >
          {/* Logo Icon */}

          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-primary-soft
              text-lg
              shadow-[var(--shadow-sm)]
              transition-all
              duration-300
              group-hover:scale-105
              group-hover:rotate-3
            "
          >
            ✨
          </div>

          {/* Logo Text */}

          <div className="hidden sm:block">
            <p
              className="
                text-base
                font-bold
                tracking-tight
                text-[var(--text-primary)]
              "
            >
              Campus Flow
              <span className="text-primary"> AI</span>
            </p>

            <p
              className="
                text-[10px]
                font-medium
                tracking-wider
                text-[var(--text-muted)]
              "
            >
              SMART CAMPUS MANAGEMENT
            </p>
          </div>

          {/* Mobile Logo */}

          <span
            className="
              text-base
              font-bold
              tracking-tight
              text-[var(--text-primary)]
              sm:hidden
            "
          >
            Campus Flow
            <span className="text-primary"> AI</span>
          </span>
        </Link>

        {/* Navigation */}

        <div className="flex items-center gap-2 sm:gap-3">

          {/* Login */}

          <Link
            href="/login"
            className="
              rounded-xl
              px-4
              py-2.5
              text-sm
              font-semibold
              text-[var(--text-secondary)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-[var(--primary-soft)]
              hover:text-primary
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
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-[var(--shadow-sm)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-primary-hover
              hover:shadow-[var(--shadow-md)]
              sm:px-5
            "
          >
            Sign Up
          </Link>

        </div>
      </div>
    </nav>
  );
}