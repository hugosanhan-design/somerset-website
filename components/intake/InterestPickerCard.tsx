'use client'
import { useState } from 'react'
import type { TopicCluster, Version } from '@/lib/intake/types'

interface Chip {
  cluster: TopicCluster
  label: string
}

const CHIPS: Record<Version, Chip[]> = {
  children: [
    { cluster: 'ANIMALS', label: 'Animals' },
    { cluster: 'SPORT', label: 'Sport' },
    { cluster: 'FOOD', label: 'Food' },
    { cluster: 'TV_FILM', label: 'TV & Cartoons' },
    { cluster: 'FAMILY', label: 'Family' },
    { cluster: 'GAMING', label: 'Games' },
    { cluster: 'FOOTBALL', label: 'Football' },
    { cluster: 'NATURE', label: 'Nature' },
  ],
  teen: [
    { cluster: 'FOOTBALL', label: 'Football' },
    { cluster: 'GAMING', label: 'Gaming' },
    { cluster: 'MUSIC', label: 'Music' },
    { cluster: 'TV_FILM', label: 'TV & Series' },
    { cluster: 'SPORT', label: 'Other Sports' },
    { cluster: 'SOCIAL_FRIENDS', label: 'Friends' },
    { cluster: 'TECHNOLOGY', label: 'Tech & Internet' },
    { cluster: 'CREATIVE_ARTS', label: 'Art & Creativity' },
    { cluster: 'NATURE', label: 'Nature' },
    { cluster: 'FOOD', label: 'Food' },
    { cluster: 'TRAVEL', label: 'Travel' },
    { cluster: 'PSYCHOLOGY_PEOPLE', label: 'Psychology' },
  ],
  adult: [
    { cluster: 'SPORT', label: 'Sport' },
    { cluster: 'FOOTBALL', label: 'Football' },
    { cluster: 'MUSIC', label: 'Music' },
    { cluster: 'TV_FILM', label: 'TV & Film' },
    { cluster: 'FOOD', label: 'Food' },
    { cluster: 'TRAVEL', label: 'Travel' },
    { cluster: 'TECHNOLOGY', label: 'Technology' },
    { cluster: 'FAMILY', label: 'Family & Home' },
    { cluster: 'WORK_PROFESSIONAL', label: 'Work' },
    { cluster: 'CULTURE_HISTORY', label: 'History & Culture' },
    { cluster: 'SOCIAL_FRIENDS', label: 'Friends & Social Life' },
    { cluster: 'VALENCIA_LOCAL', label: 'Valencia' },
    { cluster: 'NATURE', label: 'Nature' },
    { cluster: 'CREATIVE_ARTS', label: 'Art & Creativity' },
    { cluster: 'PSYCHOLOGY_PEOPLE', label: 'Psychology' },
    { cluster: 'PERSONAL_DEVELOPMENT', label: 'Personal Growth' },
    { cluster: 'GAMING', label: 'Gaming' },
  ],
}

interface Props {
  version: Version
  onSubmit: (clusters: TopicCluster[]) => void
}

export default function InterestPickerCard({ version, onSubmit }: Props) {
  const chips = CHIPS[version]
  const [selected, setSelected] = useState<Set<TopicCluster>>(new Set())

  function toggle(cluster: TopicCluster) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(cluster)) {
        next.delete(cluster)
      } else {
        next.add(cluster)
      }
      return next
    })
  }

  return (
    <div style={{ padding: '24px 20px', maxWidth: 560, margin: '0 auto' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
        What topics do you enjoy?
      </h2>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>
        Tap everything that interests you.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
        {chips.map(({ cluster, label }) => {
          const isSelected = selected.has(cluster)
          return (
            <button
              key={cluster}
              onClick={() => toggle(cluster)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: '1.5px solid #6BAE2E',
                background: isSelected ? '#6BAE2E' : '#fff',
                color: isSelected ? '#fff' : '#6BAE2E',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent' as string,
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      <button
        onClick={() => selected.size > 0 && onSubmit(Array.from(selected))}
        disabled={selected.size === 0}
        style={{
          width: '100%',
          padding: '13px 0',
          borderRadius: 8,
          border: 'none',
          background: selected.size > 0 ? '#6BAE2E' : '#d1d5db',
          color: '#fff',
          fontSize: 15,
          fontWeight: 700,
          cursor: selected.size > 0 ? 'pointer' : 'not-allowed',
          fontFamily: 'inherit',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent' as string,
          transition: 'background 0.2s',
        }}
      >
        Continue →
      </button>
    </div>
  )
}
