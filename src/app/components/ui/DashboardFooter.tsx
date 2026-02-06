import { Heart } from "lucide-react";

interface DashboardFooterProps {
  role: "admin" | "staff";
}

export function DashboardFooter({ role }: DashboardFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Copyright */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>© {currentYear} KEYCAPS</span>
            <span className="hidden md:inline">•</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by Keycaps Team
            </span>
          </div>

          {/* Center: Links */}
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors font-medium">
              Documentation
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors font-medium">
              Support
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors font-medium">
              Privacy
            </a>
          </div>

          {/* Right: Status */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>All systems operational</span>
          </div>
        </div>

        {/* Bottom: Version info */}
        <div className="mt-4 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
          <span className="capitalize">{role} Dashboard</span> • Version 1.0.0
        </div>
      </div>
    </footer>
  );
}
