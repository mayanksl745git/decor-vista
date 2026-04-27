import { motion } from 'framer-motion'
import { Github, Linkedin } from 'lucide-react'
import { useState } from 'react'

const teamMembers = [
  {
    name: 'Mayank Singhal',
    role: 'Founder & CEO',
    image: '/Images/Mikk.jpg',
    initials: 'MS',
    color: 'bg-[var(--primary)]',
    social: [
      { label: 'LinkedIn', href: '#', icon: Linkedin },
      { label: 'GitHub', href: '#', icon: Github },
    ],
  },
  {
    name: 'Nandani Bisht',
    role: 'Co-Founder',
    image: '/Images/Nikk.jpg',
    initials: 'NB',
    color: 'bg-[var(--secondary)]',
    social: [{ label: 'LinkedIn', href: '#', icon: Linkedin }],
  },
  {
    name: 'Aditi Sharma',
    role: 'Partner',
    image: '/Images/aditi1.jpg',
    initials: 'AS',
    color: 'bg-[var(--accent-purple)]',
    social: [{ label: 'LinkedIn', href: '#', icon: Linkedin }],
  },
]

function TeamAvatar({ member }) {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    return (
      <div className={`flex h-24 w-24 items-center justify-center rounded-full text-2xl font-bold text-white ${member.color}`}>
        {member.initials}
      </div>
    )
  }

  return (
    <img
      src={member.image}
      alt={member.name}
      onError={() => setImageError(true)}
      className="h-24 w-24 rounded-full object-cover"
    />
  )
}

export default function TeamSection() {
  return (
    <section id="team" className="relative">
      <div className="section-shell">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="section-heading">Meet The Team</h2>
          <p className="section-subtitle">
            Design thinkers, product builders, and collaborators shaping a smarter future for interior design.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03, y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="glass-card rounded-[24px] p-8"
            >
              <TeamAvatar member={member} />
              <h3 className="mt-6 text-2xl font-bold text-[var(--dark)]">{member.name}</h3>
              <p className="mt-2 text-sm font-medium text-[var(--text-secondary)]">{member.role}</p>

              <div className="mt-6 flex gap-3">
                {member.social.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(255,107,53,0.1)] text-[var(--primary)] transition duration-300 hover:-translate-y-0.5 hover:bg-[var(--primary)] hover:text-white"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16"
        >
          <h3 className="text-center text-2xl font-bold text-[var(--dark)]">Partners & Collaborators</h3>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="glass-card flex min-h-28 items-center justify-center rounded-[24px] border border-dashed border-slate-300 text-sm font-semibold text-[var(--text-secondary)]"
              >
                Partner Logo
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
