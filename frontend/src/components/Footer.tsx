import {
  Utensils,
  Instagram,
  Linkedin,
  Twitter,
  Github,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      icon: Linkedin,
      href: "https://www.linkedin.com/in/anika-gangwar-3a10772b1/",
      label: "LinkedIn",
    },
    {
      icon: Github,
      href: "https://github.com/anika0520",
      label: "GitHub (Anika)",
    },
    {
      icon: Github,
      href: "https://github.com/palSukanya",
      label: "GitHub (Sukanya)",
    },
  ];
  const quickLinks = [
    { label: "Home", href: "#" },
    { label: "What We Do", href: "#what-we-do" },
    { label: "Services", href: "#services" },
    { label: "FAQ", href: "#" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ];

  return (
    <footer className="relative pt-20 pb-8 border-t border-border/30">
      <div className="absolute inset-0 cyber-grid opacity-10" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Utensils className="w-8 h-8 text-primary" />
              <span className="font-display font-bold text-xl text-gradient">
                ForkMEtoFind
              </span>
            </div>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              The only lost and found system that runs on pure chaos, caffeine,
              and the collective anxiety of losing things. Made with 💚 by
              forgetful bestfriends, for forgetful students.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 rounded-lg bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 hover:scale-110"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-foreground mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-bold text-foreground mb-4">
              Legal Stuff
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-foreground mb-4">
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-sm">Email us at</p>
                  <a
                    href="mailto:anikagangwar2005@gmail.com"
                    className="text-foreground hover:text-primary transition-colors text-sm"
                  >
                    anikagangwar2005@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-sm">Find us at</p>
                  <p className="text-foreground text-sm">
                    Somewhere in Campus, Lost Building
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-sm">
                    Call us (if desperate)
                  </p>
                  <p className="text-foreground text-sm">+91 LOST-ITEM-HELP</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* About Us Section */}
        <div className="glass-card rounded-2xl p-8 mb-12 border-border/30">
          <h4 className="font-display font-bold text-xl text-foreground mb-4">
            About Us
          </h4>
          <p className="text-muted-foreground leading-relaxed">
            ForkMEtoFind was born from the collective frustration of losing
            things and the realization that college lost-and-found systems are
            basically graveyards for forgotten items. We're a team of two who’ve
            seen friends lose countless pens, chargers, and maybe even a few
            brain cells along the way. Our mission? To create the most chaotic
            yet effective lost and found platform that actually works. No more
            asking "Has anyone seen my..." in WhatsApp groups with 500 unread
            messages or email spams. Welcome to the future of finding stuff.
            It's messy, it's fun, and it works.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/30">
          <p className="text-muted-foreground text-sm mb-4 md:mb-0">
            © {currentYear} ForkMEtoFind. All rights reserved. Built with chaos
            and caffeine.
          </p>
          <p className="text-muted-foreground text-sm">
            Made with <span className="text-primary">🍴</span> by forgetful
            humans
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
