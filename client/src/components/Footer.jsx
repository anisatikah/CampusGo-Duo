// client/src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-16">
      <div className="container-app py-8 text-xs text-ink-400 flex flex-col sm:flex-row gap-2 sm:gap-6 items-center justify-between">
        <p>© {new Date().getFullYear()} DuoPilot Campus · Built for UNIMAS & UiTM Samarahan students.</p>
        <p className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-volt-500 animate-pulse" />
          2 Crew Onboard · always.
        </p>
      </div>
    </footer>
  );
}
