// Server-only student access map for Student's Corner "Your area".
//
// Imported ONLY by app/api/student/access/route.ts (a server route), so the codes
// never reach the browser bundle — a student can't view-source to find another
// student's code or content. To add or change a student, edit the STUDENTS map below
// and redeploy. (Names are matched case- and accent-insensitively; codes are exact.)
//
// Low-stakes access codes by design (not passwords). If you ever want them out of the
// repo, move each `code` to an env var and read it here.

export interface StudentLink {
  emoji: string
  title: string
  desc: string
  href: string
}
export interface StudentArea {
  displayName: string
  links: StudentLink[]
}

// ── Shared course links ─────────────────────────────────────────────────────
// Add these to any student's `links` array when they are enrolled in that course.
const B1_UNIT1_COURSE: StudentLink = {
  emoji: '📚',
  title: 'B1 Unit 1 — Online Course',
  desc: 'Me & My Day · vocabulary, grammar, reading, speaking and writing — all in one place.',
  href: '/courses/b1-unit-1',
}

const SPANISH_EXPATS_COURSE: StudentLink = {
  emoji: '🍊',
  title: 'Spanish for Expats — Module 1',
  desc: 'The First Month · NIE, empadronamiento, key oficina phrases, poder + infinitive — all in Valencia context.',
  href: '/courses/spanish-expats',
}

const MONDAY_YOUNG_ADULTS: StudentLink = {
  emoji: '🎉',
  title: 'Monday Young Adults · Digital course',
  desc: 'Festivals Practice Pack (PDF) and the Lamu listening, with online exercises and a short writing.',
  href: '/courses/monday-young-adults',
}

const SOUND_TECH_ENGLISH: StudentLink = {
  emoji: '🎧',
  title: 'English for Sound Technicians · Digital course',
  desc: 'Three weeks of words, grammar, reading, listening and writing, all about your job. Speaking is for our classes.',
  href: '/courses/sound-tech-english',
}

const STUDENTS: Record<string, { code: string; area: StudentArea }> = {
  // Teacher's own test account — sees every course so new material can be checked
  // from the student side before it is assigned to anyone.
  hugo: {
    code: 'HUGO-TEST',
    area: {
      displayName: 'Hugo',
      links: [B1_UNIT1_COURSE, SPANISH_EXPATS_COURSE, MONDAY_YOUNG_ADULTS, SOUND_TECH_ENGLISH],
    },
  },
  miriam: {
    code: 'MIRIAM-EIRE',
    area: {
      displayName: 'Miriam',
      links: [MONDAY_YOUNG_ADULTS],
    },
  },
  alejandra: {
    code: 'ALEJANDRA-K7Q2',
    area: { displayName: 'Alejandra', links: [MONDAY_YOUNG_ADULTS] },
  },
  ivan: {
    code: 'IVAN-T4K9',
    area: { displayName: 'Ivan', links: [SOUND_TECH_ENGLISH] },
  },
  david: {
    code: 'DAVID-M4X9',
    area: { displayName: 'David', links: [MONDAY_YOUNG_ADULTS] },
  },
  alex: {
    code: 'ALEX-AUG',
    area: {
      displayName: 'Álex',
      links: [
        {
          emoji: '🎙️',
          title: 'Your 30-Day August Plan',
          desc: 'Daily Use of English and reading, plus speaking questions you record and get scored.',
          href: '/Alex-August-30-Day-Plan.html',
        },
      ],
    },
  },
  ibra: {
    code: 'IBRA-B2',
    area: {
      displayName: 'Ibra',
      links: [
        {
          emoji: '🧩',
          title: 'Word Formation — rules & practice',
          desc: 'The rules of thumb and 32 drills for Use of English Part 3.',
          href: '/Ibra-Word-Formation.html',
        },
        {
          emoji: '⏱️',
          title: 'Exam-day warm-up',
          desc: '31 quick self-check questions to warm up before the real exam.',
          href: '/Ibra-Exam-Prep-Tuesday.html',
        },
      ],
    },
  },
}

function normaliseName(s: string): string {
  return s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function lookupStudent(name: string, code: string): StudentArea | null {
  const rec = STUDENTS[normaliseName(name)]
  if (!rec) return null
  if (rec.code !== code.trim()) return null
  return rec.area
}
