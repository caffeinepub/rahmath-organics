export function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer className="bg-navy-800 text-sidebar-foreground mt-16">
      <div className="container mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <img
              src="/assets/uploads/logo-019d2a55-dc4d-77d7-a037-2e6570260456-1.jpeg"
              alt="Rahamath Organics"
              className="h-12 w-auto"
            />
          </div>
          <p className="text-sm text-sidebar-foreground/70">
            Bringing nature's finest organic products directly to your doorstep.
            100% natural, certified organic.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">
            Shop
          </h4>
          <ul className="space-y-2 text-sm text-sidebar-foreground/70">
            <li>
              <a href="/" className="hover:text-white transition-colors">
                All Products
              </a>
            </li>
            <li>
              <a
                href="/?mode=wholesale"
                className="hover:text-white transition-colors"
              >
                Wholesale
              </a>
            </li>
            <li>
              <a href="/order" className="hover:text-white transition-colors">
                Place Order
              </a>
            </li>
            <li>
              <a href="/track" className="hover:text-white transition-colors">
                Track Order
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">
            Company
          </h4>
          <ul className="space-y-2 text-sm text-sidebar-foreground/70">
            <li>
              <a href="/" className="hover:text-white transition-colors">
                About Us
              </a>
            </li>
            <li>
              <a href="/" className="hover:text-white transition-colors">
                Contact
              </a>
            </li>
            <li>
              <a href="/" className="hover:text-white transition-colors">
                Blog
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">
            Support
          </h4>
          <ul className="space-y-2 text-sm text-sidebar-foreground/70">
            <li>
              <a
                href="https://www.instagram.com/rahamath_organics"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                📷 rahamath_organics
              </a>
            </li>
            <li>
              <a
                href="mailto:Rahamathorganics@gmail.com"
                className="hover:text-white transition-colors"
              >
                ✉️ Rahamathorganics@gmail.com
              </a>
            </li>
            <li>
              <span>🕐 Mon–Sat 9am–6pm</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-sidebar-foreground/50">
          <span>© {year} RAHMATH ORGANICS. All rights reserved.</span>
          <span>
            Built with ❤️ using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors underline"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
