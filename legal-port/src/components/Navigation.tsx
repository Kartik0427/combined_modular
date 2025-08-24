export default function Navigation() {
  const navigationItems = [
    { label: "Home", href: "#home" },
    { label: "Features", href: "#features" },
    { label: "Advisors", href: "#advisors" },
    { label: "Contact", href: "#contact" },
  ];
  return (
    <nav className="flex items-center space-x-6">
      {navigationItems.map((item) => (
        <a
          key={item.label}
          href={item.href}
          className="font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}