import { LanguageToggle } from "@/components/language-toggle";

// Public auth pages (login, register, verify) share a language switcher pinned
// top-right. Accept-Language still sets the initial locale; this lets visitors
// override it before signing in, and the choice carries into the app.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div className="absolute right-4 top-4 z-50">
        <LanguageToggle />
      </div>
      {children}
    </div>
  );
}
