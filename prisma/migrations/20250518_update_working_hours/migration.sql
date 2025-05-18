-- First, update existing working hours to new format

UPDATE business_settings
SET "workingHours" =
  ( SELECT jsonb_build_object( 'Monday', jsonb_build_object('enabled', true, 'start', "workingHours"->>'start', 'end', "workingHours"->>'end'), 'Tuesday', jsonb_build_object('enabled', true, 'start', "workingHours"->>'start', 'end', "workingHours"->>'end'), 'Wednesday', jsonb_build_object('enabled', true, 'start', "workingHours"->>'start', 'end', "workingHours"->>'end'), 'Thursday', jsonb_build_object('enabled', true, 'start', "workingHours"->>'start', 'end', "workingHours"->>'end'), 'Friday', jsonb_build_object('enabled', true, 'start', "workingHours"->>'start', 'end', "workingHours"->>'end'), 'Saturday', jsonb_build_object('enabled', false, 'start', "workingHours"->>'start', 'end', "workingHours"->>'end'), 'Sunday', jsonb_build_object('enabled', false, 'start', "workingHours"->>'start', 'end', "workingHours"->>'end') ));

-- Then remove the workingDays column

ALTER TABLE business_settings
DROP COLUMN IF EXISTS "workingDays";