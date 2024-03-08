import Link from "next/link";

export function Navbar() {
  const links = [
    { href: "/#search-now", text: "Search Now!" },
    { href: "/#services", text: "Services" },
    { href: "/#about", text: "About" },
  ];

  return (
    <nav className="ml-6 flex items-center gap-6 text-sm">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={"transition-colors hover:text-foreground/80"}
        >
          {link.text}
        </Link>
      ))}
    </nav>
  );
}
