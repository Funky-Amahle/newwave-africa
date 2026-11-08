# NW-16 / DESIGN-20

Adds continuous slow wave, orbit, paper and circle motion to shared StoryArtwork (discovery cards and featured card). Existing observer/tab visibility gates pause animation; reduced effects and system reduced motion disable it. Text/layout/playback unchanged.

Verified: Pages production build including type validation; exported route/assets checker; git diff check; independent Quality Guardian source review. Browser confirmed transforms change over time on visible cards, and Reduced effects makes all artwork animations none and clears active artwork flags. Re-enabled effects for preview. System media-query guard inspected; OS preference not changed.

Owner approval required before merge/deploy. Rollback by reverting this CSS change.
