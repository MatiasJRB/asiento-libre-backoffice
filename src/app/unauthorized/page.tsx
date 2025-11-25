export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Acceso No Autorizado
        </h1>
        <p className="text-gray-600 mb-8">
          No tienes permisos para acceder a esta aplicación.
        </p>
        <p className="text-sm text-gray-500">
          Esta aplicación es solo para administradores de Asiento Libre.
        </p>
      </div>
    </div>
  )
}
