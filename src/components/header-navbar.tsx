import Link from "next/link";

export function Navbar() {
  const links = [
    { href: "/#search-now", text: "Search Now!" },
    { href: "/#services", text: "Services" },
    { href: "/#about", text: "About" },
  ];

  return (
    <nav className="flex items-center gap-6 text-sm">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-foreground/60 transition-colors hover:text-foreground/80"
        >
          {link.text}
        </Link>
      ))}
    </nav>
  );
}
