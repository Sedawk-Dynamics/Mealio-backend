import Image from "next/image";
import RegistrationForm from "@/components/RegistrationForm";
import { EatisoLogo, EatisoMark } from "@/components/EatisoLogo";

const HIGHLIGHTS = [
  "Quick 2-minute registration",
  "Secure Aadhaar document upload",
  "Your data is encrypted & private",
];

export default function HomePage() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-purple-50/40">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-stretch gap-0 p-4 lg:flex-row lg:items-center lg:gap-8 lg:p-8">
        {/* Brand / hero panel */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-purple via-brand-purple-dark to-[#3f1650] p-8 text-white shadow-brand lg:w-[44%] lg:self-stretch lg:p-10">
          {/* Soft glowing blobs */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-orange/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-brand-purple-light/30 blur-3xl" />

          <div className="relative flex h-full flex-col">
            {/* Logo on white pill so the purple swirl pops */}
            <div className="inline-flex w-fit items-center gap-3 rounded-2xl bg-white/95 px-4 py-2.5 shadow-lg">
              <EatisoLogo size={40} />
            </div>

            {/* Featured lifestyle photo — centered */}
            <div className="my-8 flex justify-center lg:my-10">
              <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-3xl ring-4 ring-white/20 shadow-2xl">
                <Image
                  src="/image.png"
                  alt="The eatiso family sharing a meal together"
                  fill
                  priority
                  sizes="(max-width: 1024px) 80vw, 320px"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="lg:mt-auto">
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                Welcome to the
                <br />
                <span className="text-brand-orange-light">eatiso</span> family
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-purple-100/90">
                Create your account in minutes. Fill in your details and upload
                your Aadhaar document to complete your registration.
              </p>

              <ul className="mt-8 space-y-3">
                {HIGHLIGHTS.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-orange text-white">
                      <CheckIcon />
                    </span>
                    <span className="text-purple-50">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Floating watermark swirl */}
            <div className="pointer-events-none absolute -bottom-6 right-2 opacity-10 lg:animate-float">
              <EatisoMark size={150} className="[&_*]:!stroke-white [&_circle]:!fill-white" />
            </div>
          </div>
        </section>

        {/* Form panel */}
        <section className="flex flex-1 items-center justify-center py-8 lg:py-0">
          <div className="w-full max-w-md">
            {/* Mobile-only logo (hero is hidden visual emphasis on desktop) */}
            <div className="mb-6 flex justify-center lg:hidden">
              <EatisoLogo size={44} />
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Create your account
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Please fill in all the fields below to register.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
              <RegistrationForm />
            </div>

            <p className="mt-5 text-center text-xs text-slate-400">
              🔒 Your information is stored securely and used for verification
              only.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function CheckIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
