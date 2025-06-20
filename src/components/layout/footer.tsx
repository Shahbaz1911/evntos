
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Instagram, Linkedin, Rss } from 'lucide-react'; // Using Rss for blog as placeholder
import { useEffect } from 'react';

export default function Footer() {

  useEffect(() => {
    // Calculate footer height and set as CSS variable
    const footerElement = document.querySelector('footer');
    if (footerElement) {
      const footerHeight = footerElement.offsetHeight;
      document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
    }
  }, []);


  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
  ];

  const footerNavs = [
    {
      label: "Product",
      items: [
        { href: '/#features', name: 'Features' }, // Assuming you might add a features section
        { href: '/#pricing', name: 'Pricing' }, // Assuming pricing section
        { href: '/faq', name: 'FAQ' },
        { href: '/#testimonials', name: 'Testimonials' },
      ],
    },
    {
      label: "Company",
      items: [
        { href: '/#about', name: 'About Us' },
        { href: '/blog', name: 'Blog' },
        { href: '/careers', name: 'Careers' },
        { href: '/contact', name: 'Contact Us' },
      ],
    },
    {
      label: "Legal",
      items: [
        { href: '/terms', name: 'Terms of Service' },
        { href: '/privacy', name: 'Privacy Policy' },
        { href: '/cookies', name: 'Cookie Policy' },
      ],
    }
  ];

  return (
    <footer className="bg-card text-card-foreground border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand and Social */}
          <div className="space-y-6">
            <Link href="/" className="text-3xl font-bold font-headline text-primary">
              eventos
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm">
              Create, promote, and manage your events effortlessly. Join our community and make your next event a success.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((item) => (
                <Button key={item.name} variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-primary">
                  <a href={item.href} target="_blank" rel="noopener noreferrer">
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.name}</span>
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          {footerNavs.map((nav) => (
            <div key={nav.label} className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground">{nav.label}</h4>
              <ul className="space-y-2">
                {nav.items.map((item) => (
                  <li key={item.name}>
                    <Button variant="link" asChild className="p-0 h-auto font-normal text-muted-foreground hover:text-primary hover:no-underline">
                      <Link href={item.href}>{item.name}</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border/60 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Eventos Inc. All rights reserved.</p>
          <p className="mt-1">
            Built with <span role="img" aria-label="love">❤️</span> by talented developers.
          </p>
        </div>
      </div>
    </footer>
  );
}
