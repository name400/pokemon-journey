# Eleven unresolved native aliases — read-only source audit

Pinned source: `7c0881255af5cd51992e513ff93c2f71adbe40e0`. Snapshot: `data/rogue-form-support-inventory.json` has 11 unconnected non-base forms with a null `classicNativeForm` result. A null mapping does not establish that the simulator lacks the form.

| Source form(s) | Native identity | Pinned availability | Decision |
|---|---|---|---|
| Xerneas `active` | `xerneas` | Active/inactive form triggers are present; same stats, type and Fairy Aura as neutral | Exact alias is safe to implement with the active/inactive source persistence path. No code change during the integration freeze. |
| Marshadow `zenith` | No dedicated native identity; base Marshadow has identical battle stats | `generation-07.ts` explicitly sets `isStarterSelectable: false`, `isUnobtainable: true`; no form-change trigger found | Keep player acquisition/fusion rejected. Equal stats alone do not authorize activation. |
| Revavroom `segin/schedar/navi/ruchbah/caph-starmobile` | No dedicated native identities | All five are `isUnobtainable: true`, not starter selectable; trainer configuration explicitly creates these enemy forms | Keep player fusion rejected. A future enemy-only adapter would need the source 580-BST stats, type, moves and trainer route; mapping them to ordinary Revavroom would be incorrect. |
| Ogerpon `teal/wellspring/hearthflame/cornerstone-mask-tera` | `ogerpontealtera`, `ogerponwellspringtera`, `ogerponhearthflametera`, `ogerponcornerstonetera` | Explicit Tera and LapseTera source triggers | Native aliases exist and match stats, types and corrected Embody Aspect abilities. Connect only together with actual Tera lifetime, ability, source-form save/restore and lapse behavior, not as four freely acquired static forms. |

Evidence locations in the pinned tree:

- `src/data/balance/species/generation-06.ts:8895` (Xerneas active data), `:8920` (active/inactive triggers).
- `src/data/balance/species/generation-07.ts:9467` (Zenith), including explicit unobtainable flags near the end of that form.
- `src/data/balance/species/generation-09.ts:4937`, `:4962`, `:4987`, `:5012`, `:5037` (five Starmobiles; each has an explicit unobtainable flag).
- `src/data/trainers/trainer-config.ts:3365`, `:3392`, `:3419`, `:3446`, `:3473` (named Team Star enemy forms), `:6881` (random enemy Starmobile).
- `src/data/balance/species/generation-09.ts:10458` onward (four Tera mask forms), `:10570` onward (Tera/lapse transitions).

A read-only Node assertion checked all five existing native candidates against source base stats and the enum-corrected primary ability. Native types also match: Fairy; Grass; Grass/Water; Grass/Fire; Grass/Rock. These are identity checks, not executed Tera/active-form integration tests. Result: **one cosmetic active alias candidate, six protected unavailable/enemy forms, four real Tera lifecycle candidates**. Source artwork availability does not change these restrictions.
