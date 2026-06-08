# Design QA

## Scope

Prototype: TripCrew / CDMX Weekend core trip experience.

Reference direction: hybrid of the generated chat-first adaptive itinerary concept and map-first regroup concept. The prototype intentionally keeps the more contemporary text and interaction style from those options while simplifying the visual system for a runnable web prototype.

## Checks

- Mobile viewport verified at 390 x 844.
- All five primary tabs fit within the viewport.
- No horizontal page overflow detected.
- Generated CDMX map asset loads successfully.
- Main jump actions navigate between Today, Adapt, and Regroup screens.
- Plan cards, reactions, budget choices, and low-power check-in toggle respond to clicks.
- Invite, nudge, meetup, check-in, menu, and settlement draft controls now provide prototype feedback.
- Settlement draft modal verified from the Budget screen.
- Browser console checked for errors.

## Notes

- This is a clickable product prototype, not a native app implementation.
- Location, Bluetooth, payments, map routing, and budget calculations are mocked.
- The map asset is generated artwork and should be replaced by a real map provider if the team moves into implementation.

Final result: passed.
