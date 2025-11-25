export default function SuspendedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-error mb-4">
          Cuenta Suspendida
        </h1>
        <p className="text-neutral-600 mb-8">
          Tu cuenta ha sido suspendida.
        </p>
        <p className="text-sm text-neutral-500">
          Por favor contacta al administrador para más información.
        </p>
      </div>
    </div>
  )
}
