# DESIGN-10 — Controls alignment repair
Evidence: user screenshots show the category/search filter row and story audio voice selector feeling misaligned. Fix keeps native controls, focus rings, labels and responsive layouts.
CSS: consistent control heights, equal minmax columns, aligned labels, voice action grid with full-width select, helper text on its own row, consistent card attribution spacing. At tablet/card widths controls stack instead of compressing.
QA: check 320/375/768/1024/1440 widths, 200% zoom, keyboard focus, multiple voice choices and Stop/Pause states. No browser screenshot QA has been completed yet.
