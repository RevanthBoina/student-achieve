import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Trophy } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-bold font-poppins text-lg mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-gold" />
              About Student Book of World Records
            </h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link to="/about" className="hover:text-gold transition-colors">
                  Our Mission
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gold transition-colors">
                  Team
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gold transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Browse */}
          <div>
            <h3 className="font-bold font-poppins text-lg mb-4">Browse</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link to="/" className="hover:text-gold transition-colors">
                  All Records
                </Link>
              </li>
              <li>
                <Link
                  to="/leaderboard"
                  className="hover:text-gold transition-colors"
                >
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-gold transition-colors">
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Submit */}
          <div>
            <h3 className="font-bold font-poppins text-lg mb-4">Submit</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link
                  to="/create-break"
                  className="hover:text-gold transition-colors"
                >
                  New Record
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gold transition-colors">
                  Guidelines
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gold transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold font-poppins text-lg mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-gold transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-gold transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60">
            © 2024 Student Book of World Records. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="text-primary-foreground/60 hover:text-gold transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-primary-foreground/60 hover:text-gold transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-primary-foreground/60 hover:text-gold transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
