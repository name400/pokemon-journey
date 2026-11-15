// A single D1 statement reads the world and the party from the same snapshot.
// Ambiguous legacy saves retain the original lookup and engine selection path.
// Keep the candidate sets separate: D1 can reject a multi-term UNION at prepare time.
export const movementWorldSql=`SELECT state,revision,
 CASE WHEN json_extract(state,'$.adventureEngine')='cloud'
   AND (json_type(state,'$.teamIds') IS NULL OR json_type(state,'$.teamIds')='array')
   AND (json_type(state,'$.adventurePendingMoves') IS NULL OR json_type(state,'$.adventurePendingMoves')='array')
 THEN (SELECT json_group_array(json_object('id',id,'data',data,'origin',origin)) FROM (
   SELECT id,data,origin FROM pokemon_box p WHERE p.user_id=worlds.user_id AND (
     p.id IN (SELECT value FROM json_each(worlds.state,'$.teamIds') WHERE type='text' AND length(value)<=100)
     OR p.id IN (SELECT value FROM json_each(json_array(
       CASE WHEN json_type(worlds.state,'$.activeId')='text' THEN json_extract(worlds.state,'$.activeId') END,
       CASE WHEN json_type(worlds.state,'$.zaSide108ReceivedId')='text' THEN json_extract(worlds.state,'$.zaSide108ReceivedId') END,
       CASE WHEN json_type(worlds.state,'$.zaSide39ReceivedId')='text' THEN json_extract(worlds.state,'$.zaSide39ReceivedId') END,
       CASE WHEN json_type(worlds.state,'$.zaTradeHeracrossId')='text' THEN json_extract(worlds.state,'$.zaTradeHeracrossId') END
     )) WHERE type='text' AND length(value)<=100)
     OR p.id IN (SELECT CASE WHEN type='object' THEN json_extract(value,'$.boxId') END FROM json_each(worlds.state,'$.adventurePendingMoves') WHERE CASE WHEN type='object' THEN json_type(value,'$.boxId')='text' AND length(json_extract(value,'$.boxId'))<=100 ELSE 0 END)
     OR p.id IN (SELECT value FROM json_each(?) WHERE type='text' AND length(value)<=100)
   ) ORDER BY created_at,id
 )) ELSE NULL END AS movement_box FROM worlds WHERE user_id=?`;
