"use client";

import Link from "next/link";

const features = [
  {
    icon: "🎓",
    title: "Student Experience",
    description:
      "Access announcements, events, complaints, notifications, and personal campus information from one intelligent platform.",
    accent: "bg-primary-soft",
  },
  {
    icon: "👨‍🏫",
    title: "Faculty Management",
    description:
      "Handle student complaints, manage communication, and keep campus activities organised through a centralised workspace.",
    accent: "bg-accent-soft",
  },
  {
    icon: "🏫",
    title: "Smart Administration",
    description:
      "Streamline campus operations and improve collaboration between students, faculty, and administrators.",
    accent: "bg-success-soft",
  },
];

const steps = [
  {
    number: "01",
    title: "Connect",
    description:
      "Students, faculty, and administrators come together on one unified campus platform.",
  },
  {
    number: "02",
    title: "Communicate",
    description:
      "Share announcements, events, updates, and important campus information in one place.",
  },
  {
    number: "03",
    title: "Take Action",
    description:
      "Submit complaints, track progress, and manage campus operations more efficiently.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-500">
      {/* =====================================================
          HERO SECTION
      ====================================================== */}

      <section className="relative flex min-h-[calc(100vh-73px)] items-center overflow-hidden px-6 py-24 sm:py-32">
        {/* Animated Background Orbs */}

        <div
          className="
            pointer-events-none
            absolute
            -left-32
            top-10
            h-72
            w-72
            rounded-full
            bg-primary-soft
            blur-3xl
            opacity-70
            animate-pulse
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -right-32
            top-24
            h-80
            w-80
            rounded-full
            bg-accent-soft
            blur-3xl
            opacity-60
            animate-pulse
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            bottom-0
            left-1/2
            h-64
            w-64
            -translate-x-1/2
            rounded-full
            bg-primary-soft
            blur-3xl
            opacity-30
          "
        />

        {/* Decorative Grid */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            opacity-[0.025]
            [background-image:linear-gradient(var(--text-primary)_1px,transparent_1px),linear-gradient(90deg,var(--text-primary)_1px,transparent_1px)]
            [background-size:60px_60px]
          "
        />

        {/* Hero Content */}

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center text-center">
          {/* Badge */}

          <div
            className="
              glass
              mb-8
              inline-flex
              items-center
              gap-2
              rounded-full
              px-5
              py-2.5
              text-sm
              font-medium
              text-[var(--text-secondary)]
              shadow-[var(--shadow-sm)]
              transition-all
              duration-300
              hover:-translate-y-1
              hover:shadow-[var(--shadow-md)]
            "
          >
            <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />

            <span>Smarter campus management starts here</span>

            <span className="text-base">✦</span>
          </div>

          {/* Heading */}

          <h1
            className="
              max-w-5xl
              text-5xl
              font-bold
              leading-[1.05]
              tracking-[-0.04em]
              text-[var(--text-primary)]
              sm:text-6xl
              md:text-7xl
              lg:text-8xl
            "
          >
            Your Campus.
            <span
              className="
                block
                bg-gradient-to-r
                from-primary
                via-accent
                to-primary
                bg-clip-text
                text-transparent
              "
            >
              One Intelligent Flow.
            </span>
          </h1>

          {/* Description */}

          <p
            className="
              mt-8
              max-w-2xl
              text-base
              leading-8
              text-[var(--text-secondary)]
              sm:text-lg
              md:text-xl
            "
          >
            Campus Flow AI connects students, faculty, and administrators
            through one modern platform designed to make campus communication
            and operations simpler, faster, and smarter.
          </p>

          {/* CTA Buttons */}

          <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
            <Link
              href="/login"
              className="
                group
                flex
                w-full
                items-center
                justify-center
                gap-2
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
                hover:shadow-[var(--shadow-glow)]
                sm:w-auto
              "
            >
              Get Started

              <span
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              >
                →
              </span>
            </Link>

            <Link
              href="#about"
              className="
                glass
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-2xl
                px-8
                py-4
                text-base
                font-semibold
                text-[var(--text-primary)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-[var(--shadow-md)]
                sm:w-auto
              "
            >
              Explore Campus Flow

              <span>↓</span>
            </Link>
          </div>

          {/* Supporting Text */}

          <div
            className="
              mt-8
              flex
              flex-wrap
              items-center
              justify-center
              gap-5
              text-sm
              text-[var(--text-muted)]
            "
          >
            <span>✓ Built for modern campuses</span>
            <span className="hidden sm:block">•</span>
            <span>✓ One unified platform</span>
            <span className="hidden sm:block">•</span>
            <span>✓ Designed for everyone</span>
          </div>

          {/* Floating Preview Card */}

          <div
            className="
              glass
              mt-20
              w-full
              max-w-4xl
              rounded-[2rem]
              p-3
              shadow-[var(--shadow-lg)]
              transition-all
              duration-500
              hover:-translate-y-2
            "
          >
            <div
              className="
                glass-subtle
                rounded-[1.5rem]
                p-6
                sm:p-8
              "
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-lg">
                    ✦
                  </div>

                  <div className="text-left">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      Campus Flow AI
                    </p>

                    <p className="text-xs text-[var(--text-muted)]">
                      Intelligent campus dashboard
                    </p>
                  </div>
                </div>

                <div className="hidden rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success sm:block">
                  System Active
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="glass rounded-2xl p-5 text-left">
                  <p className="text-xs text-[var(--text-muted)]">
                    Announcements
                  </p>

                  <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
                    12
                  </p>
                </div>

                <div className="glass rounded-2xl p-5 text-left">
                  <p className="text-xs text-[var(--text-muted)]">
                    Upcoming Events
                  </p>

                  <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
                    08
                  </p>
                </div>

                <div className="glass rounded-2xl p-5 text-left">
                  <p className="text-xs text-[var(--text-muted)]">
                    Active Complaints
                  </p>

                  <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
                    04
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ABOUT / FEATURES SECTION
      ====================================================== */}

      <section
        id="about"
        className="
          relative
          border-t
          border-[var(--border)]
          px-6
          py-24
          sm:py-32
        "
      >
        <div className="mx-auto max-w-6xl">
          {/* Section Heading */}

          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span
              className="
                text-sm
                font-semibold
                uppercase
                tracking-[0.2em]
                text-primary
              "
            >
              One Platform
            </span>

            <h2
              className="
                mt-4
                text-3xl
                font-bold
                tracking-tight
                text-[var(--text-primary)]
                sm:text-4xl
                md:text-5xl
              "
            >
              Everything your campus needs.
            </h2>

            <p
              className="
                mt-5
                text-base
                leading-7
                text-[var(--text-secondary)]
                sm:text-lg
              "
            >
              A connected digital experience built to simplify everyday
              campus life and operations.
            </p>
          </div>

          {/* Feature Cards */}

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="
                  glass
                  group
                  rounded-3xl
                  p-7
                  transition-all
                  duration-500
                  hover:-translate-y-2
                  hover:shadow-[var(--shadow-lg)]
                "
              >
                <div
                  className={`
                    mb-6
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    text-2xl
                    transition-transform
                    duration-500
                    group-hover:scale-110
                    group-hover:rotate-3
                    ${feature.accent}
                  `}
                >
                  {feature.icon}
                </div>

                <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                  {feature.title}
                </h3>

                <p className="mt-4 leading-7 text-[var(--text-secondary)]">
                  {feature.description}
                </p>

                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-primary">
                  Explore more

                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ====================================================== */}

      <section className="px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="glass rounded-[2rem] p-8 sm:p-12 md:p-16">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              {/* Left */}

              <div>
                <span
                  className="
                    text-sm
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-accent
                  "
                >
                  How it works
                </span>

                <h2
                  className="
                    mt-4
                    text-3xl
                    font-bold
                    tracking-tight
                    text-[var(--text-primary)]
                    sm:text-4xl
                  "
                >
                  Campus operations,
                  <span className="block text-[var(--text-secondary)]">
                    simplified.
                  </span>
                </h2>

                <p className="mt-5 leading-7 text-[var(--text-secondary)]">
                  Campus Flow AI brings the right people, information, and
                  actions together so your campus can move forward without
                  unnecessary complexity.
                </p>
              </div>

              {/* Steps */}

              <div className="space-y-4">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className="
                      glass-subtle
                      group
                      flex
                      gap-5
                      rounded-2xl
                      p-5
                      transition-all
                      duration-300
                      hover:-translate-x-1
                    "
                  >
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-primary-soft
                        text-sm
                        font-bold
                        text-primary
                      "
                    >
                      {step.number}
                    </div>

                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)]">
                        {step.title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className="px-6 pb-24 sm:pb-32">
        <div
          className="
            relative
            mx-auto
            max-w-6xl
            overflow-hidden
            rounded-[2rem]
            bg-primary
            px-8
            py-16
            text-center
            shadow-[var(--shadow-lg)]
            sm:px-12
            sm:py-20
          "
        >
          {/* CTA Background */}

          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-20
              h-64
              w-64
              rounded-full
              bg-white/10
              blur-3xl
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-20
              -left-20
              h-64
              w-64
              rounded-full
              bg-white/10
              blur-3xl
            "
          />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Ready to make campus life smarter?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
              Join Campus Flow AI and experience a more connected,
              transparent, and efficient campus ecosystem.
            </p>

            <Link
              href="/login"
              className="
                mt-8
                inline-flex
                items-center
                gap-2
                rounded-2xl
                bg-white
                px-8
                py-4
                text-base
                font-semibold
                text-primary
                shadow-lg
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-xl
              "
            >
              Get Started

              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          FLOATING ACTION BUTTON
      ====================================================== */}

      <Link
        href="/login"
        aria-label="Get started with Campus Flow AI"
        className="
          fixed
          bottom-6
          left-6
          z-40
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-full
          bg-primary
          text-xl
          text-white
          shadow-[var(--shadow-lg)]
          transition-all
          duration-300
          hover:-translate-y-1
          hover:scale-105
          hover:bg-primary-hover
          hover:shadow-[var(--shadow-glow)]
          sm:hidden
        "
      >
        →
      </Link>
    </main>
  );
}