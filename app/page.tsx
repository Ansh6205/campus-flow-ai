import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100vh-73px)] items-center justify-center overflow-hidden px-6 py-20">
        {/* Background Glow */}
        <div
          className="
            pointer-events-none
            absolute
            left-[10%]
            top-[10%]
            h-72
            w-72
            rounded-full
            bg-primary-soft
            blur-3xl
            opacity-60
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            right-[10%]
            top-[20%]
            h-72
            w-72
            rounded-full
            bg-accent-soft
            blur-3xl
            opacity-50
          "
        />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
          {/* Badge */}
          <div
            className="
              glass
              mb-10
              inline-flex
              items-center
              rounded-full
              px-6
              py-3
              text-base
              font-medium
              text-[var(--text-secondary)]
            "
          >
            <span className="mr-2">🚀</span>
            The smarter way to manage your campus
          </div>

          {/* Main Heading */}
          <h1
            className="
              max-w-5xl
              text-5xl
              font-bold
              tracking-tight
              text-[var(--text-primary)]
              sm:text-6xl
              md:text-7xl
              lg:text-8xl
            "
          >
            Manage Your Campus.
            <span className="block text-[var(--text-secondary)]">
              Smarter.
            </span>
          </h1>

          {/* Description */}
          <p
            className="
              mt-8
              max-w-3xl
              text-lg
              leading-8
              text-[var(--text-secondary)]
              sm:text-xl
            "
          >
            Campus Flow AI brings students, faculty, and campus operations
            together in one intelligent platform.
          </p>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
            {/* Get Started */}
            <Link
              href="/login"
              className="
                rounded-2xl
                bg-primary
                px-8
                py-4
                text-base
                font-semibold
                text-white
                shadow-[var(--shadow-md)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:bg-primary-hover
                hover:shadow-[var(--shadow-lg)]
              "
            >
              Get Started
            </Link>

            {/* Learn More */}
            <Link
              href="#about"
              className="
                rounded-2xl
                border
                border-[var(--border-strong)]
                bg-[var(--glass-bg)]
                px-8
                py-4
                text-base
                font-semibold
                text-[var(--text-primary)]
                backdrop-blur-xl
                transition-all
                duration-300
                hover:-translate-y-1
                hover:bg-[var(--glass-bg-hover)]
                hover:shadow-[var(--shadow-md)]
              "
            >
              Learn More
            </Link>
          </div>

          {/* Supporting Text */}
          <p
            className="
              mt-10
              text-sm
              text-[var(--text-muted)]
              sm:text-base
            "
          >
            Built for modern campus management.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="
          border-t
          border-[var(--border)]
          px-6
          py-24
          transition-colors
          duration-300
        "
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Students */}
            <div
              className="
                glass
                rounded-3xl
                p-8
                transition-all
                duration-300
                hover:-translate-y-2
              "
            >
              <div
                className="
                  mb-5
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-primary-soft
                  text-2xl
                "
              >
                🎓
              </div>

              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                For Students
              </h2>

              <p className="mt-3 leading-7 text-[var(--text-secondary)]">
                Access announcements, events, complaints, notifications, and
                your personal campus information from one place.
              </p>
            </div>

            {/* Faculty */}
            <div
              className="
                glass
                rounded-3xl
                p-8
                transition-all
                duration-300
                hover:-translate-y-2
              "
            >
              <div
                className="
                  mb-5
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-accent-soft
                  text-2xl
                "
              >
                👨‍🏫
              </div>

              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                For Faculty
              </h2>

              <p className="mt-3 leading-7 text-[var(--text-secondary)]">
                Manage student complaints, campus communication, events, and
                announcements through a centralized platform.
              </p>
            </div>

            {/* Administration */}
            <div
              className="
                glass
                rounded-3xl
                p-8
                transition-all
                duration-300
                hover:-translate-y-2
              "
            >
              <div
                className="
                  mb-5
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-success-soft
                  text-2xl
                "
              >
                🏫
              </div>

              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                For Administration
              </h2>

              <p className="mt-3 leading-7 text-[var(--text-secondary)]">
                Streamline campus operations and improve communication between
                students, faculty, and administrators.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}