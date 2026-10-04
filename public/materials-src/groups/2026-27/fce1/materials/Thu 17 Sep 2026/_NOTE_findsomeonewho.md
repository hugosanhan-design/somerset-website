# Thu 17 Sep 2026, first 20 minutes: Find your common ground

**What this is.** A 20-minute opener before today's Unit 1 pp.8-9 material (`FCEI_Unit1_pp8-9_17Sep2026.html`, same folder, not touched or duplicated). Ten B2-level personal-interest questions; the three students interview each other and record notes, then agree as a group on two or three things they have in common. Purpose: get all three talking to each other, especially Isabella, who is brand new to Martina and Víctor. Built per Hugo's brief 17 Sep 2026: "una version más corta para los primeros 20 mins, 10 preguntas sobre sus gustos y buscar cosas que tienen en común."

**Files.** `FCEI_FindSomeoneWho_17Sep2026.pdf`, 3 pages, one personalised page per student (Martina, Víctor, Isabella), each with the other two classmates' names already in the recording-grid columns. `..._TEACHER.pdf`, 2 pages: timing run-sheet for the 20 minutes, the ten questions with a follow-up prompt for each, and a note on drawing Isabella in early.

**Logo.** Built as the canonical CSS flexbox text lockup (`reference_somerset_logo.md`), not an inline SVG or a data-URI image, both of those have caused rendering bugs in past builds.

**A layout bug caught in verification.** The first teacher-file draft put the full timing table and the ten-question table on one page inside the fixed-height `.pg`/`.in` flex layout; the content didn't fit, and instead of flowing onto a second page WeasyPrint's flexbox shrink behaviour compressed a box and overlapped it with the next section, and the question table then split across a page break. Fixed by giving the run-sheet two explicit pages: timing on page 1, the full ten-question table (never split) on page 2. Worth remembering for any other run-sheet built inside this template.

**Fonts.** PDFs rendered in the cloud sandbox with WeasyPrint, which cannot reach Google Fonts, so they render in fallback serif/sans. Every page checked visually at 100 dpi via pdftoppm: no overflow, no task split across a page break. Open the HTML on the Mac for Fraunces and Instrument Sans.
