const navItems = ["Dashboard", "Students", "Payments", "Reports"];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Dark overlay behind the sidebar on mobile; clicking it closes the menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 py-5 text-lg font-semibold tracking-tight border-b border-slate-800">
          Fee Manager
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <a
              key={item}
              href="#"
              onClick={onClose}
              className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                item === "Dashboard"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item}
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
}
