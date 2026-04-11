import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { PRIORITY_MAP, PRIORITY_COLORS } from '../data/reportStore'
import StatusBadge from '../components/ui/StatusBadge'

const GMAPS_KEY = ''

function mapUrl(loc) {
  const enc = encodeURIComponent(loc)
  if (GMAPS_KEY) return `https://www.google.com/maps/embed/v1/place?key=${GMAPS_KEY}&q=${enc}&zoom=15`
  return `https://maps.google.com/maps?q=${enc}&output=embed&z=15`
}

export default function IssueDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { reports, updateReportStatus, activeDept } = useApp()
  const hov = (on) => document.body.classList.toggle('cursor-hover', on)

  const r = reports.find((x) => x.id === Number(id))
  if (!r) {
    navigate('/login')
    return null
  }

  const priority = PRIORITY_MAP[r.categoryId] || 'Medium'
  const priColor = PRIORITY_COLORS[priority]
  const deptKey = (activeDept || '').toLowerCase()
  const backTo = activeDept ? `/dashboard/${deptKey}` : '/login'

  const LogoIcon = () => (
    <div style={{ width: '2rem', height: '2rem', background: 'var(--fg)', borderRadius: '0.5rem' }} className="flex items-center justify-center flex-shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
        <circle cx="12" cy="8" r="3" /><circle cx="6" cy="14" r="2.5" /><circle cx="18" cy="14" r="2.5" />
        <path d="M12 11v3M8.8 12.6L6 14M15.2 12.6L18 14" />
      </svg>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Topbar */}
      <div style={{ background: 'var(--card)', borderBottom: '1.5px solid var(--border)', padding: '1rem 1.75rem', position: 'sticky', top: 0, zIndex: 20 }} className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <LogoIcon />
          <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '1.1rem', color: 'var(--fg)' }}>CitySync</span>
        </div>
        <button
          onClick={() => navigate(backTo)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1.1rem', border: '1.5px solid var(--border)', borderRadius: '9999px', fontFamily: "'Sora',sans-serif", fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', background: 'var(--card)', cursor: 'none', transition: 'all 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--fg)'; e.currentTarget.style.color = 'var(--fg)'; hov(true) }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; hov(false) }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Split body */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 0 }} className="det-body">
        {/* Left panel */}
        <div style={{ overflowY: 'auto', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'var(--bg)' }}>
          {/* Complaint ID + status */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2" style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.82rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.04em' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
              </svg>
              # CMP-2025-{String(r.id).padStart(4, '0')}
            </div>
            <StatusBadge status={r.status} />
          </div>

          {/* Title block */}
          <div className="flex items-center gap-3">
            <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: 'rgba(26,158,143,.12)', fontSize: '1.4rem', flexShrink: 0 }} className="flex items-center justify-center">
              {r.icon}
            </div>
            <div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.35rem', fontWeight: 800, color: 'var(--fg)', lineHeight: 1.2 }}>{r.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.2rem' }}>Reported on {r.date} · {r.channel} · #{r.id}</div>
              <div style={{ marginTop: '0.35rem', fontSize: '0.78rem', fontWeight: 600 }}>
                Priority{' '}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.18rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, fontFamily: "'Sora',sans-serif", background: `${priColor}20`, color: priColor, border: `1px solid ${priColor}40`, marginLeft: '0.25rem' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: priColor, display: 'inline-block' }} />
                  {priority}
                </span>
              </div>
            </div>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '🏛️', bg: 'rgba(74,144,217,.1)', label: 'Department', val: r.department, valStyle: { fontSize: '0.82rem' } },
              {
                icon: r.status === 'Resolved' ? '✅' : r.status === 'In Progress' ? '🔵' : '🟠',
                bg: 'rgba(26,158,143,.1)', label: 'Status', val: r.status,
                valStyle: { color: r.status === 'Resolved' ? '#166534' : r.status === 'In Progress' ? '#1e40af' : '#854d0e' }
              },
            ].map((card) => (
              <div key={card.label} style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '0.875rem', padding: '1rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '2.4rem', height: '2.4rem', borderRadius: '0.6rem', background: card.bg, fontSize: '1.1rem', flexShrink: 0 }} className="flex items-center justify-center">{card.icon}</div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 600, fontFamily: "'Sora',sans-serif", marginBottom: '0.15rem', letterSpacing: '0.04em' }}>{card.label}</div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.88rem', fontWeight: 700, color: 'var(--fg)', ...card.valStyle }}>{card.val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '0.875rem', padding: '1.1rem 1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', fontFamily: "'Sora',sans-serif", marginBottom: '0.6rem' }}>Description</div>
            <p style={{ fontSize: '0.9rem', color: 'var(--fg)', lineHeight: 1.7 }}>{r.description}</p>
          </div>

          {/* Location */}
          <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '0.875rem', padding: '1.1rem 1.25rem' }}>
            <div className="flex items-start gap-3">
              <div style={{ width: '2.2rem', height: '2.2rem', background: 'rgba(26,158,143,.1)', borderRadius: '0.5rem', fontSize: '1rem', flexShrink: 0 }} className="flex items-center justify-center">📍</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 600, fontFamily: "'Sora',sans-serif", marginBottom: '0.25rem', letterSpacing: '0.04em' }}>LOCATION</div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '0.95rem', color: 'var(--fg)' }}>{r.location || 'Not provided'}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.1rem' }}>Mumbai, Maharashtra 400001</div>
                <button
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.location)}`, '_blank')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.38rem 0.85rem', marginTop: '0.65rem', border: '1.5px solid var(--border)', borderRadius: '9999px', background: 'var(--card)', fontFamily: "'Sora',sans-serif", fontSize: '0.75rem', fontWeight: 700, color: 'var(--fg)', cursor: 'none', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; hov(true) }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--fg)'; hov(false) }}
                >
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                  Open in Maps
                </button>
              </div>
            </div>
          </div>

          {/* Phone */}
          {r.phone && (
            <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '0.875rem', padding: '1.1rem 1.25rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', fontFamily: "'Sora',sans-serif", marginBottom: '0.6rem' }}>Reporter Contact</div>
              <div className="flex items-center gap-2">
                <div style={{ width: '1.8rem', height: '1.8rem', borderRadius: '50%', background: 'var(--bg2)', fontSize: '0.85rem' }} className="flex items-center justify-center">📞</div>
                <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{r.phone}</span>
              </div>
            </div>
          )}

          {/* Media */}
          <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '0.875rem', padding: '1.1rem 1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', fontFamily: "'Sora',sans-serif", marginBottom: '0.75rem' }}>Media</div>
            {r.photo ? (
              <div className="grid grid-cols-3 gap-2">
                <div style={{ borderRadius: '0.5rem', overflow: 'hidden', aspectRatio: '4/3', background: '#eee' }}>
                  <img src={r.photo} alt="Issue" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                {[0, 1].map((i) => (
                  <div key={i} style={{ borderRadius: '0.5rem', background: 'var(--bg2)', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                    No more photos
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem', background: 'var(--bg2)', borderRadius: '0.5rem' }}>
                No photos uploaded for this report
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '0.875rem', padding: '1.1rem 1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', fontFamily: "'Sora',sans-serif", marginBottom: '0.75rem' }}>Actions</div>
            <div className="flex gap-2 flex-wrap">
              {['Pending', 'In Progress', 'Resolved'].filter((s) => s !== r.status).map((s) => (
                <button
                  key={s}
                  onClick={() => updateReportStatus(r.id, s)}
                  style={{ padding: '0.5rem 1.1rem', border: '1.5px solid var(--primary)', borderRadius: '0.5rem', background: 'transparent', color: 'var(--primary)', fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '0.82rem', cursor: 'none', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(26,158,143,.08)'; hov(true) }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; hov(false) }}
                >
                  Mark as: {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel — map */}
        <div style={{ position: 'sticky', top: 64, height: 'calc(100vh - 64px)', background: '#e8eef0', overflow: 'hidden' }}>
          {r.location ? (
            <iframe
              src={mapUrl(r.location)}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              loading="lazy"
              title="Issue location map"
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--primary)', background: 'linear-gradient(135deg,#e8f4f2,#d1ece8)' }}>
              <svg width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, fontFamily: "'Sora',sans-serif" }}>No location provided</span>
            </div>
          )}

          {/* Map legend */}
          <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(255,255,255,.92)', borderRadius: '0.75rem', padding: '0.75rem 1rem', boxShadow: '0 4px 16px rgba(0,0,0,.1)', backdropFilter: 'blur(8px)' }}>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.35rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Legend</div>
            {[
              { color: '#166534', label: 'Resolved' },
              { color: '#1e40af', label: 'In Progress' },
              { color: '#854d0e', label: 'Pending' },
              { color: '#e04b4b', label: 'High Priority' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5" style={{ fontSize: '0.72rem', color: 'var(--fg)', marginBottom: '0.2rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, flexShrink: 0, display: 'inline-block' }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom actions bar */}
      <div style={{ padding: '0.85rem 1.5rem', background: 'var(--card)', borderTop: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {[
          { icon: '↑', label: 'Share' },
          { icon: '↓', label: 'Download' },
          { icon: '•••', label: 'More ▾' },
        ].map((btn) => (
          <button
            key={btn.label}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.1rem', border: '1.5px solid var(--border)', borderRadius: '9999px', background: 'var(--card)', fontFamily: "'Sora',sans-serif", fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', cursor: 'none', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--fg)'; e.currentTarget.style.color = 'var(--fg)'; hov(true) }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; hov(false) }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}