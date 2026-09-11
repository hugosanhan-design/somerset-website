/**
 * SINGLE SOURCE for the "Who we are" copy.
 *
 * Both the /about page and the homepage's story section read from here, so the
 * two can never drift apart — the same rule the navigation now follows.
 *
 * Everything in this file is a fact already published on the site (the homepage
 * pillars, the stats strip, the footer, the Google reviews). Do not add claims
 * that are not verifiable somewhere else on the site.
 */

export const story = {
  eyebrow: "Our story",
  headline: ["English for everyone", "who needs it"] as const,
  body:
    "Somerset Language Centre was founded in Valencia in 2013 with a single purpose: bring quality English teaching to everyone. Our method is fundamentally practical, based on oral communication — we put students in real, useful situations so they think and communicate in English from day one.",
};

export const founders = {
  initials: "H&S",
  names: "Hugo & Sara Hancock",
  note: "Founders · Sara has 40+ years of teaching experience",
};

export const pillars = [
  {
    title: "Small groups",
    body:
      "Between 8 and 10 students per class. Every student gets real attention — not just a seat in the room.",
  },
  {
    title: "Native & bilingual teachers",
    body:
      "All our teachers are native or bilingual, qualified and experienced. You'll learn from people who live the language.",
  },
  {
    title: "Expert teaching",
    body:
      "Co-founder Sara has 40+ years of teaching experience. Deep expertise that shapes every lesson, every level, every student.",
  },
];

export const facts = [
  { value: "2013", label: "Year established" },
  { value: "8–10", label: "Students per class" },
  { value: "40+", label: "Years of Sara's teaching experience" },
  { value: "5.0★", label: "Google rating · 49 reviews" },
];

/** Real Google reviews, already shown on the homepage. */
export const voices = [
  {
    text:
      "Es una academia familiar con un trato personal y muy bueno. Las clases son reducidas y los profesores muy atentos. Lo recomiendo a todo el mundo 100%.",
    name: "Raquel Roldán",
  },
  {
    text:
      "He realizado varios cursos en esta academia, tanto para el B2, como para el C1 (superados ambos) y ha sido una gran experiencia. Los profesores están realmente volcados en el alumnado y se ajustan perfectamente a nuestras necesidades.",
    name: "Ana Benavent",
  },
];
