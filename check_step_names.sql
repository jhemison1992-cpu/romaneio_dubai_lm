SELECT 
  ist.id,
  ist.inspection_item_id,
  e.name as environment_name,
  ist.step_order,
  ist.step_name
FROM installation_steps ist
JOIN inspection_items ii ON ist.inspection_item_id = ii.id
JOIN environments e ON ii.environment_id = e.id
ORDER BY e.name, ist.step_order;
