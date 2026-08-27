import Link from "next/link";

const COLUMNS = [
  {
    heading: "Shop",
    links: [
      { href: "/products", label: "All products" },
      { href: "/products?category=Outerwear", label: "Outerwear" },
      { href: "/products?category=Knitwear", label: "Knitwear" },
      { href: "/products?category=Accessories", label: "Accessories" },
    ],
  },
  {
    heading: "Account",
    links: [
      { href: "/favorites", label: "Favorites" },
      { href: "/cart", label: "Cart" },
      { href: "/sign-in", label: "Sign in" },
      { href: "/sign-up", label: "Create account" },
    ],
  },
  {
    heading: "Store",
    links: [
      { href: "/products", label: "New arrivals" },
      { href: "/products?category=Shirts", label: "Shirts" },
      { href: "/products?category=Trousers", label: "Trousers" },
      { href: "/products?category=Dresses", label: "Dresses" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-bone-deep">
      <div className="shell py-16 md:py-20">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)] md:gap-8">
          <div className="max-w-sm">
            <p className="font-display text-2xl leading-tight">
              Abdirahman Asad
              <span className="ml-2 font-sans text-[0.6rem] uppercase tracking-[0.28em] text-muted">
                Store
              </span>
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Quality clothes for every day. Good fabrics, fair prices, and
              pieces made to last.
            </p>

            <address className="mt-6 not-italic text-sm leading-relaxed text-muted">
              Suuqyare-Madiina
              <br />
              Mogadishu-Somalia
              <br />
              <a
                href="mailto:meenka3126@gmail.com"
                className="link-underline mt-2 inline-block text-ink"
              >
                meenka3126@gmail.com
              </a>
            </address>
          </div>

          <div className="grid grid-cols-3 gap-x-4 gap-y-8 md:contents">
            {COLUMNS.map((column) => (
              <nav key={column.heading} aria-label={column.heading}>
                <h2 className="eyebrow text-muted">{column.heading}</h2>
                <ul className="mt-5 flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={`${column.heading}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="link-underline text-sm text-ink-soft transition-colors hover:text-ink"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} Abdirahman Asad Store. All rights
            reserved.
          </p>
          <p className="flex flex-wrap gap-x-6 gap-y-2">
            <span>Open Mon to Fri, 9:00&ndash;18:00 EAT</span>
            <span>We ship worldwide</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
