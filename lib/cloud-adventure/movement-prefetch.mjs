// A single D1 statement reads the world and the party from the same snapshot.
// Ambiguous legacy saves retain the original lookup and engine selection path.
export const movementWorldSql=`SELECT state,revision,
 CASE WHEN json_extract(state,'$.adventureEngine')='cloud'
   AND (json_type(state,'$.teamIds') IS NULL OR json_type(state,'$.teamIds')='array')
   AND (json_type(state,'$.adventurePendingMoves') IS NULL OR json_type(state,'$.adventurePendingMoves')='array')
 THEN (SELECT json_group_array(json_object('id',id,'data',data,'origin',origin)) FROM (
   SELECT id,data,origin FROM pokemon_box p WHERE p.user_id=worlds.user_id AND p.id IN (
     SELECT value FROM json_each(worlds.state,'$.teamIds') WHERE type='text' AND length(value)<=100
     UNION SELECT json_extract(worlds.state,'$.activeId') WHERE json_type(worlds.state,'$.activeId')='text' AND length(json_extract(worlds.state,'$.activeId'))<=100
     UNION SELECT json_extract(worlds.state,'$.zaTradeHeracrossId') WHERE json_type(worlds.state,'$.zaTradeHeracrossId')='text' AND length(json_extract(worlds.state,'$.zaTradeHeracrossId'))<=100
     UNION SELECT CASE WHEN type='object' THEN json_extract(value,'$.boxId') END FROM json_each(worlds.state,'$.adventurePendingMoves') WHERE CASE WHEN type='object' THEN json_type(value,'$.boxId')='text' AND length(json_extract(value,'$.boxId'))<=100 ELSE 0 END
     UNION SELECT value FROM json_each(?) WHERE type='text' AND length(value)<=100
   ) ORDER BY created_at,id
 )) ELSE NULL END AS movement_box FROM worlds WHERE user_id=?`;
