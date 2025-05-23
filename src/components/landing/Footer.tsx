'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';

export default function Footer() {
  const footerLinks = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '#features' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'About', href: '#about' },
        { name: 'FAQ', href: '#faq' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '#about' },
        { name: 'Careers', href: '#careers' },
        { name: 'Blog', href: '#blog' },
        { name: 'Contact', href: '#contact' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' }
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: '#' },
    { icon: Twitter, href: '#' },
    { icon: Instagram, href: '#' },
    { icon: Linkedin, href: '#' }
  ];

  return (
    <footer className="bg-[#0b3559] text-white">
      <div className="container mx-auto px-4 py-16 max-w-[1400px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand */}
          <AnimatedSection direction="up">
            <div className="lg:col-span-2">
              <Link href="/" className="text-2xl font-sans font-bold mb-6 inline-block">
                Meetly
              </Link>
              <p className="text-white/80 font-sans font-normal mb-8 max-w-md">
                Streamline your client management with our all-in-one platform. Schedule meetings, track payments, and automate reminders.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <AnimatedSection
                    key={index}
                    delay={0.1 * index}
                    direction="up"
                  >
                    <Link
                      href={social.href}
                      className="text-white/80 hover:text-white transition-colors duration-200"
                    >
                      <social.icon className="w-6 h-6" />
                    </Link>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Links */}
          {footerLinks.map((column, index) => (
            <AnimatedSection
              key={index}
              delay={0.2 * index}
              direction="up"
            >
              <div>
                <h3 className="text-lg font-sans font-semibold mb-6">
                  {column.title}
                </h3>
                <ul className="space-y-4">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="text-white/80 hover:text-white font-sans font-normal transition-colors duration-200"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          ))}

          {/* Subscription Form */}
          <AnimatedSection delay={0.4} direction="up" className="lg:col-span-2 lg:col-start-5">
            <div className="grid">
              <h3 className="font-display text-lg font-semibold mb-4">
                Subscribe to Our Newsletter
              </h3>
              <p className="text-white/80 mb-6">
                Stay updated with the latest features and updates
              </p>
              <form className="flex flex-col gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                />
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-[#e42627] hover:bg-[#d41f20] text-white rounded-lg font-display font-semibold transition-colors duration-200"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </AnimatedSection>
        </div>

        <AnimatedSection delay={0.6}>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/60">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-white/60 font-sans font-normal text-sm">
                © {new Date().getFullYear()} Meetly. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link href="#" className="text-white/60 hover:text-white font-sans font-normal text-sm transition-colors duration-200">
                  Privacy Policy
                </Link>
                <Link href="#" className="text-white/60 hover:text-white font-sans font-normal text-sm transition-colors duration-200">
                  Terms of Service
                </Link>
                <Link href="#" className="text-white/60 hover:text-white font-sans font-normal text-sm transition-colors duration-200">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </footer>
  );
} 