# Love Ball species checks in older saves

The [Love Ball rules](https://bulbapedia.bulbagarden.net/wiki/Love_Ball) require an active, opposite-gender Pokémon of the same species for its 8× modifier. Older saved Pokémon can omit `speciesId`; comparing two missing values previously treated unknown or different species as equal. The capture calculation now resolves missing species IDs from the existing Pokédex by saved form ID, and gives no bonus when the species cannot be determined. Different known forms of the same species still match. The calculation does not rewrite any saved Pokémon, encounter, ball inventory, or existing battle snapshot.

Isolated tests cover matching and differing legacy species, unknown IDs, known regional forms, gender and fainted-lead cases, and that saved objects are unchanged. The existing rare-ball and representative capture tests run separately. Original hardware and production were not tested.
