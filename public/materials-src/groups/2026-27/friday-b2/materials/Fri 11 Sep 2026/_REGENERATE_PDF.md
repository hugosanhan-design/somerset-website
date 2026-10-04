# The teacher PDF needs regenerating

**11 Sep 2026, evening.** `FCEI_FirstDay_Booklet_11Sep2026_TEACHER.html` was corrected after class:

- Lucía added as a sixth student: a column in all four tracking grids (26 rows), plus "five" corrected to "six" in the run sheet prose.
- Group renamed from "FCE I" to "Friday B2" in the headers, since Friday is a separate class.

The matching PDF could **not** be regenerated. The cloud sandbox cannot fetch the Fraunces and Instrument Sans web fonts the page uses, so WeasyPrint falls back to different metrics and page 3 overflows: the "What this is measuring" box collides with the "Answer key, 36 marks" heading, and the closing paragraph collides with the footer. Shipping that would have been worse than shipping nothing.

**To fix:** regenerate the PDF on a machine that can load the two Google fonts, then delete `_archive/FCEI_FirstDay_Booklet_11Sep2026_TEACHER_5col_SUPERSEDED.pdf`.

The old five-column PDF has been moved to `_archive/` so nobody prints it by mistake. The student booklet PDF is **also one word stale**: its HTML now reads "I will know all six of you" where the PDF still says five. It carries no roster grid, so that is the only difference. Regenerate it in the same pass.
