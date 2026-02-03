// src/app/pages/NotFound.tsx
import { Link } from "react-router";

export function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold mb-4 text-gray-900">404</h1>
        <p className="text-2xl mb-8 text-gray-600">Page not found!</p>
        <Link
          to="/"
          className="bg-gray-900 text-white px-8 py-3 rounded-lg inline-block hover:bg-gray-800 transition-colors font-medium"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}