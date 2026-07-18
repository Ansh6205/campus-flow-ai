import Navbar from "@/components/navbar/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6">
        <div className="max-w-3xl text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Manage Your Campus.
            <br />
            Smarter.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Campus Flow AI brings students, faculty, and campus operations
            together in one intelligent platform.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <button className="rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800">
              Get Started
            </button>

            <button className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-100">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}