# Classic Pokémon form name visibility

The user clarified that form suffixes such as `Normal` and `네 식구` must be hidden, rather than translated. Classic battle, switch, starter, reward, evolution, capture and item/party views use a display-only formatter; saved names and form data are not rewritten. Unrecognized Korean nickname suffixes are retained unless the base name or form metadata identifies them as a form.

Validation: display-name, evolution image and starter tests passed; TypeScript and production build passed; isolated browser checks covered 320–430px mobile and 1280px desktop, including switching and Psyduck-to-Golduck imagery. Physical devices have not been tested. This supersedes the earlier translated-suffix presentation noted in EVOLUTION_MOBILE_PRESENTATION_QA_20261105.md. Sites deployment is managed separately by the user.

Follow-up: independent QA found the single-battle player HUD still displayed the raw name after switching. The single HUD, default classic prompt and switch prompts now use the same display-only helper. The isolated browser fixture actually switched to `갸라도스 · Normal` and verified the resulting HUD says `갸라도스` at 320×568, 375×667, 390×844, 430×932 and 1280×850. TypeScript passed; physical devices and production remain untested.
