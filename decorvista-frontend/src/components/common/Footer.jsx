import { Linkedin, Instagram, Twitter, Youtube } from 'lucide-react'
import { Link } from 'react-router-dom'

const footerGroups = [
  {
    title: 'Product',
    links: [
      { label: 'AI Redesign', href: '/ai-redesign' },
      { label: 'Vastu', href: '/vastu' },
      { label: '3D Visualizer', href: '/visualizer' },
      { label: 'Gallery', href: '/gallery' },
      { label: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Team', href: '#team' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '#' },
      { label: 'FAQ', href: '#' },
      { label: 'Privacy Policy', href: '#' },
    ],
  },
]

const socialLinks = [
  { label: 'Instagram', href: '#', icon: Instagram },
  { label: 'Twitter/X', href: '#', icon: Twitter },
  { label: 'LinkedIn', href: '#', icon: Linkedin },
  { label: 'YouTube', href: '#', icon: Youtube },
]

export default function Footer() {
  return (
    <footer className="bg-[var(--dark)] text-white">
      <div className="section-shell">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div className="max-w-sm">
            <Link to="/" className="font-display text-3xl font-bold tracking-tight">
              <span className="text-[var(--primary)]">Decor</span>
              Vista
            </Link>
            <p className="mt-5 text-sm leading-7 text-white/70">Design smarter with AI</p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-lg font-semibold">{group.title}</h3>
              <div className="mt-5 flex flex-col gap-3 text-sm text-white/70">
                {group.links.map((link) =>
                  link.href.startsWith('/') ? (
                    <Link key={link.label} to={link.href} className="transition duration-300 hover:text-white">
                      {link.label}
                    </Link>
                  ) : (
                    <a key={link.label} href={link.href} className="transition duration-300 hover:text-white">
                      {link.label}
                    </a>
                  ),
                )}
              </div>
            </div>
          ))}

          <div>
            <h3 className="text-lg font-semibold">Social</h3>
            <div className="mt-5 flex flex-col gap-3 text-sm text-white/70">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a key={label} href={href} className="flex items-center gap-3 transition duration-300 hover:text-white">
                  <Icon className="h-4 w-4 text-[var(--accent)]" />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-sm text-white/60">
          © 2025 DecorVista. Built with ❤️ by Mayank Singhal & Team
        </div>
      </div>
    </footer>
  )
}
