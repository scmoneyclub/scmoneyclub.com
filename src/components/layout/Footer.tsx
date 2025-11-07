import Link from 'next/link';
import { Bot, Coins, Twitter, Instagram, Github } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const investmentLinks = [
    { name: 'Artificial Intelligence', href: '/investments/artificial-intelligence', icon: Bot },
    { name: 'Cryptocurrency', href: '/investments/crypto', icon: Coins },
    // { name: 'Gold', href: '/investments/gold', icon: Gem },
  ];

  const companyLinks = [
    { name: 'About', href: '/about' },
    { name: 'Join', href: '/join' },
    { name: 'Login', href: '/login' },
    { name: 'Contact', href: '/contact' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Use', href: '/terms' },
  ];

  const socialLinks = [
    { name: 'Twitter', href: 'https://x.com/scmoneyclub', icon: Twitter },
    { name: 'Instagram', href: 'http://instagram.com/scmoneyclub', icon: Instagram },
    { name: 'GitHub', href: 'https://github.com/scmoneyclub', icon: Github },
  ];

  return (
    <footer className="bg-black border-t border-gray-900">
      <div className="container mx-auto px-6 py-12 lg:py-16">
        <Link href="/">
          <Image src="/scmc-logo.svg" alt="SC Money Club" width={64} height={64} className="mx-auto"/>
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">SC Money Club</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              A private club of action takers who want the very best out of life.
            </p>
            <div className="flex gap-4 pt-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </Link>
                );
              })}
            </div>
          </div>
          {/* Investments Section */}
          <div>
            <h4 className="text-white font-semibold mb-4">Investments</h4>
            <ul className="space-y-3">
              {investmentLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm group"
                    >
                      <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          {/* Company Section */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Legal & Contact Section */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 mb-6">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            {/* <div className="pt-4 border-t border-gray-900">
              <Link
                href="mailto:contact@scmoneyclub.com"
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm group"
              >
                <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>contact@scmoneyclub.com</span>
              </Link>
            </div> */}
          </div>
        </div>
        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-900">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              &copy; {currentYear} SC Money Club. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm">
              Private Investment Club
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

