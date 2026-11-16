# Rank X battle-zone expansion

[Rank X trainer data](https://www.serebii.net/legendsz-a/z-aroyale/rankx.shtml) lists the teams, levels and moves of the six opponents added here: Kylian, Kiara, Adem, Noah, Nesrine and Kais. The existing four opponents and their identifiers remain in place. The game's turn-based battle system is retained. According to the [Z-A Royale guide](https://www.serebii.net/legendsz-a/z-aroyale.shtml), waiters offer healing after defeat; Kais now offers it once per visit.

The source contains further Rank X opponents that are not yet implemented. The compressed arena, NPC tile coordinates, existing 450-point award per win, 4,000-point threshold and per-visit behavior are project approximations, not verified original positions or exact rules. No other trainer-class bonus is inferred here.

Existing Pokémon, items, earned points and wins are not migrated. Unknown entries in the visit win array are preserved when an opponent is defeated. New markers are hidden while occupied by a player with a pre-existing saved location, appearing after that player leaves. Unknown versions of the healer record are retained rather than normalized.

An isolated API check covered two added battles, reconnect, the waiter heal, duplicate rejection, unknown win records, party data and leaving a saved marker position. A field test checked the six teams, supported moves, accessibility and saved-position behavior. These checks do not establish a full natural playthrough, precise original locations, actual-device behavior, production D1, or the Sites merged build. Existing failure records and the disabled experimental menu clock remain unchanged.
