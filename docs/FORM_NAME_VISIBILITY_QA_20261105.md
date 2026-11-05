# Classic Pokémon form name visibility

The user clarified that form suffixes such as `Normal` and `네 식구` must be hidden, rather than translated. Classic battle, switch, starter, reward, evolution, capture and item/party views use a display-only formatter; saved names and form data are not rewritten. Unrecognized Korean nickname suffixes are retained unless the base name or form metadata identifies them as a form.

Validation: display-name, evolution image and starter tests passed; TypeScript and production build passed; isolated browser checks covered 320–430px mobile and 1280px desktop, including switching and Psyduck-to-Golduck imagery. Physical devices have not been tested. This supersedes the earlier translated-suffix presentation noted in EVOLUTION_MOBILE_PRESENTATION_QA_20261105.md. Sites deployment is managed separately by the user.
