// Course detail content, ported from the old site (somersetlc.com/cursos/*) on
// Hugo's confirmation (18 Jul 2026) that the schedule data there is still accurate.
// Day/time grids there are baked into images; transcribed by hand from screenshots.
//
// Note on "Exam preparation" > Summer Intensive: the old site's flyer carries a
// specific date range (25/06/26–24/07/26) that will already have passed/be stale by
// the time this ships. The recurring weekly pattern, hours and price are real and
// kept; the specific dates are intentionally NOT hardcoded here — replace
// `intensiveDates` below each summer once Hugo confirms next year's.

export interface ScheduleSession {
  day: string;
  time: string;
}

export interface ScheduleGroup {
  label?: string;
  sessions: ScheduleSession[];
}

export interface CourseLevel {
  name: string;
  tag?: string;
  desc: string;
  groups?: ScheduleGroup[];
  note?: string;
}

export interface CourseCategory {
  num: string;
  name: string;
  desc: string;
  summaryTags: string[];
  levels: CourseLevel[];
}

export const intensiveDates = null; // e.g. { start: "25 June 2027", end: "24 July 2027" } — set each year

export const courses: CourseCategory[] = [
  {
    num: "01",
    name: "Children",
    desc: "Learning that feels like play — solid foundations from the very start.",
    summaryTags: ["Infantil", "Primaria"],
    levels: [
      {
        name: "Flyers",
        tag: "9–11 years · 5º–6º Primaria",
        desc: "Equivalent to A2, with content designed for this age group. Students build a solid grammar base, become confident in everyday English, and start learning to organise their ideas in writing. As in all our courses, every topic is reinforced with games and activities so learning feels natural and fun.",
        groups: [
          { sessions: [{ day: "Mon", time: "17:30–18:30" }, { day: "Wed", time: "17:30–18:30" }] },
        ],
      },
    ],
  },
  {
    num: "02",
    name: "Teenagers",
    desc: "Confidence for school, exams and everything after.",
    summaryTags: ["ESO", "Bachillerato"],
    levels: [
      {
        name: "KET",
        tag: "1º–2º ESO",
        desc: "The goal is for students to genuinely communicate in English with good pronunciation and the confidence to use it effectively — building on and enriching the English they already know.",
        groups: [
          { label: "KET I — Grupo 1", sessions: [{ day: "Tue", time: "17:30–18:30" }, { day: "Thu", time: "17:30–18:30" }] },
          { label: "KET II — Grupo 1", sessions: [{ day: "Mon", time: "17:30–18:30" }, { day: "Wed", time: "17:30–18:30" }] },
          { label: "KET II — Grupo 2", sessions: [{ day: "Tue", time: "17:30–18:30" }, { day: "Thu", time: "17:30–18:30" }] },
        ],
      },
      {
        name: "PET",
        tag: "B1 · ESO",
        desc: "Courses at this level are built around all four skills tested in the official exams: Listening, Reading, Speaking and Writing.",
        groups: [
          { label: "PET I — Grupo 1", sessions: [{ day: "Tue", time: "17:30–18:30" }, { day: "Thu", time: "17:30–18:30" }] },
          { label: "PET I — Grupo 2", sessions: [{ day: "Wed", time: "15:45–17:15" }] },
          { label: "PET II — Grupo 1", sessions: [{ day: "Mon", time: "17:30–18:30" }, { day: "Wed", time: "17:30–18:30" }] },
          { label: "PET II — Grupo 2", sessions: [{ day: "Tue", time: "16:20–17:20" }, { day: "Thu", time: "16:20–17:20" }] },
        ],
      },
      {
        name: "FCE",
        tag: "B2 · ESO–Bachillerato",
        desc: "Courses designed so students can hold a conversation, read and write accurately in English. They deepen, refine and consolidate the language, working individually, in pairs and in small groups through conversation, role-play, debate and presentations.",
        groups: [
          { label: "FCE I — Grupo 1", sessions: [{ day: "Tue", time: "16:20–17:20" }, { day: "Thu", time: "16:20–17:20" }] },
          { label: "FCE I — Grupo 2", sessions: [{ day: "Fri", time: "15:45–17:45" }] },
          { label: "FCE II — Grupo 1", sessions: [{ day: "Tue", time: "16:20–17:20" }, { day: "Thu", time: "16:20–17:20" }] },
          { label: "FCE II — Grupo 2", sessions: [{ day: "Wed", time: "15:45–17:15" }] },
          { label: "FCE II — Grupo 3", sessions: [{ day: "Fri", time: "15:45–17:45" }] },
        ],
        note: "FCE II bridges into C1",
      },
      {
        name: "Level C1",
        tag: "Bachillerato & Adults",
        desc: "Designed for students aiming for an advanced level of English. Participants improve their ability to understand and express complex ideas, both spoken and written, and build the advanced reading and listening skills needed to tackle specialised texts and talks with confidence.",
        groups: [
          { label: "C1.1 — Grupo 1", sessions: [{ day: "Mon", time: "20:00–21:00" }, { day: "Wed", time: "20:00–21:00" }] },
          { label: "C1.1 — Grupo 2", sessions: [{ day: "Wed", time: "15:45–17:15" }] },
          { label: "C1.2 — Grupo 1 (exam group)", sessions: [{ day: "Mon", time: "18:45–19:45" }, { day: "Wed", time: "18:45–19:45" }] },
          { label: "C1.2 — Grupo 2", sessions: [{ day: "Mon", time: "20:00–21:00" }, { day: "Wed", time: "20:00–21:00" }] },
        ],
      },
    ],
  },
  {
    num: "03",
    name: "Adults",
    desc: "Practical English for work, travel and real life.",
    summaryTags: ["All levels", "Conversation"],
    levels: [
      {
        name: "Level A1",
        tag: "From scratch",
        desc: "The goal is for you to genuinely communicate in English with good pronunciation and the confidence to use it effectively, building on and enriching the English you already know.",
        groups: [
          { sessions: [{ day: "Tue", time: "20:00–21:00" }, { day: "Thu", time: "20:00–21:00" }] },
        ],
        note: "Subject to a minimum number of students",
      },
      {
        name: "Level B1",
        desc: "In today's world, English is key to modern life — essential for travel, for broadening your horizons, and for connecting with people from other countries. We've designed these courses so you can learn to handle everyday situations in English at your own pace, in an enjoyable way.",
        groups: [
          { label: "B1.1 — Grupo 1", sessions: [{ day: "Tue", time: "20:00–21:00" }, { day: "Thu", time: "20:00–21:00" }] },
          { label: "B1.2 — Grupo 1", sessions: [{ day: "Mon", time: "18:45–20:45" }] },
          { label: "B1.2 — Grupo 2", sessions: [{ day: "Tue", time: "18:45–19:45" }, { day: "Thu", time: "18:45–19:45" }] },
          { label: "B1/B2 — Speaking practice", sessions: [{ day: "Wed", time: "18:45–20:15" }] },
        ],
      },
      {
        name: "Level B2",
        desc: "Courses that build student confidence to communicate fully in English in any situation. We create a relaxed, comfortable environment where students can talk about all kinds of topics, with a focus on pronunciation, grammar and specific vocabulary.",
        groups: [
          { label: "B2.1", sessions: [{ day: "Mon", time: "18:45–19:45" }, { day: "Wed", time: "18:45–19:45" }] },
          { label: "B2.2", sessions: [{ day: "Tue", time: "18:45–19:45" }, { day: "Thu", time: "18:45–19:45" }] },
        ],
      },
      {
        name: "Level C1",
        tag: "CAE — Advanced",
        desc: "At this level every skill needs to reach its highest standard to pass the Cambridge exams. Advanced (CAE) is Cambridge's advanced-level certificate, demonstrating excellence in English knowledge and use — covering the specific, in-depth language skills increasingly demanded in academic and professional life.",
        groups: [
          { label: "C1 — Grupo 1", sessions: [{ day: "Wed", time: "15:45–17:15" }] },
          { label: "C1 — Grupo 2", sessions: [{ day: "Mon", time: "20:00–21:00" }, { day: "Wed", time: "20:00–21:00" }] },
          { label: "C1.2 — Grupo 1 (exam group)", sessions: [{ day: "Mon", time: "18:45–19:45" }, { day: "Wed", time: "18:45–19:45" }] },
          { label: "C1.2 — Grupo 2", sessions: [{ day: "Mon", time: "20:00–21:00" }, { day: "Wed", time: "20:00–21:00" }] },
          { label: "C1.2 — Grupo 3", sessions: [{ day: "Fri", time: "15:45–17:45" }] },
        ],
      },
    ],
  },
  {
    num: "04",
    name: "Exam preparation",
    desc: "Cambridge results without the panic — proven, structured prep.",
    summaryTags: ["B1", "B2 First", "C1 Advanced", "EVAU"],
    levels: [
      {
        name: "Summer Intensive — B2 First",
        tag: "56 hours · 4 mock exams",
        desc: "A full-immersion summer course covering every part of the Cambridge B2 First exam, run Monday to Friday over four weeks. All materials included.",
        groups: [
          { sessions: [{ day: "Mon–Thu", time: "10:00–12:30" }, { day: "Fri", time: "10:00–13:00" }] },
        ],
        note: "350 € — materials included, exam fee not included. Contact us for this year's start date.",
      },
      {
        name: "Summer Intensive — C1 Advanced",
        tag: "56 hours · 4 mock exams",
        desc: "A full-immersion summer course covering every part of the Cambridge C1 Advanced exam, run Monday to Friday over four weeks. All materials included.",
        groups: [
          { sessions: [{ day: "Mon–Thu", time: "10:00–12:30" }, { day: "Fri", time: "10:00–13:00" }] },
        ],
        note: "350 € — materials included, exam fee not included. Contact us for this year's start date.",
      },
    ],
  },
];
