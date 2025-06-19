-- Add the PerteneceAlEsquema column to the Vacuna table
-- This column is a boolean flag (BIT) to indicate if a vaccine is part of the national childhood vaccination schedule.
-- It defaults to 0 (false).

IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'PerteneceAlEsquema' AND Object_ID = Object_ID(N'dbo.Vacuna'))
BEGIN
    ALTER TABLE dbo.Vacuna
    ADD PerteneceAlEsquema BIT NOT NULL CONSTRAINT DF_Vacuna_PerteneceAlEsquema DEFAULT 0;
    PRINT 'Column PerteneceAlEsquema added to Vacuna table.';
END
ELSE
BEGIN
    PRINT 'Column PerteneceAlEsquema already exists in Vacuna table.';
END
GO

-- Now, update the existing vaccines that were just added via the seed script
-- to set the flag to 1, as they are all part of the schedule.
PRINT 'Updating seeded vaccines to set PerteneceAlEsquema = 1';
UPDATE dbo.Vacuna
SET PerteneceAlEsquema = 1
WHERE Nombre IN (
    'BCG',
    'Hepatitis B (Nacimiento)',
    'Rotavirus',
    'IPV (Polio)',
    'Neumococo',
    'Pentavalente',
    'Influenza',
    'SRP',
    'Neumococo (Refuerzo)',
    'bOPV (Refuerzo Polio)',
    'DPT (Refuerzo)'
);
PRINT 'Seeded vaccines updated successfully.';
GO
