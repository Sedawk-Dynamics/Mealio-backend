import RegistrationForm from "@/components/RegistrationForm";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Mealio Registration
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Fill in your details and upload your Aadhaar document to register.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <RegistrationForm />
      </div>

      <footer className="mt-6 text-center text-xs text-slate-400">
        Your information is stored securely. Admins only.
      </footer>
    </main>
  );
}
