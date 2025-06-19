-- Seed script for the childhood vaccination schedule based on the provided image.
-- This script uses the usp_AddVaccineToCatalog stored procedure to populate
-- the Vacuna and EsquemaVacunacion tables.

-- Manufacturer ID is assumed to be 1 for all vaccines.
DECLARE @OutputMessage NVARCHAR(255);
DECLARE @New_id_Vacuna INT;

BEGIN TRANSACTION;

BEGIN TRY

    -- Al Nacer (0 Meses)
    PRINT 'Adding vaccines for 0 months...';
    EXEC dbo.usp_AddVaccineToCatalog
        @id_Fabricante = 1,
        @Nombre = N'BCG',
        @Descripcion = N'Protección contra formas graves de tuberculosis.',
        @PerteneceAlEsquema = 1,
        @EdadRecomendadaMeses = 0,
        @NumeroDosisEsquema = 1,
        @IntervaloMesesSiguienteDosis = NULL,
        @EsRefuerzo = 0,
        @OutputMessage = @OutputMessage OUTPUT,
        @New_id_Vacuna = @New_id_Vacuna OUTPUT;

    EXEC dbo.usp_AddVaccineToCatalog
        @id_Fabricante = 1,
        @Nombre = N'Hepatitis B (Nacimiento)',
        @Descripcion = N'Protección contra la infección por hepatitis B en el recién nacido.',
        @PerteneceAlEsquema = 1,
        @EdadRecomendadaMeses = 0,
        @NumeroDosisEsquema = 1,
        @IntervaloMesesSiguienteDosis = NULL,
        @EsRefuerzo = 0,
        @OutputMessage = @OutputMessage OUTPUT,
        @New_id_Vacuna = @New_id_Vacuna OUTPUT;

    -- 2 Meses
    PRINT 'Adding vaccines for 2 months...';
    EXEC dbo.usp_AddVaccineToCatalog
        @id_Fabricante = 1,
        @Nombre = N'Rotavirus',
        @Descripcion = N'Protección contra diarreas graves producidas por rotavirus.',
        @PerteneceAlEsquema = 1,
        @EdadRecomendadaMeses = 2,
        @NumeroDosisEsquema = 2, -- Total of 2 doses in the series
        @IntervaloMesesSiguienteDosis = 2, -- Next dose is 2 months later
        @EsRefuerzo = 0,
        @OutputMessage = @OutputMessage OUTPUT,
        @New_id_Vacuna = @New_id_Vacuna OUTPUT;

    EXEC dbo.usp_AddVaccineToCatalog
        @id_Fabricante = 1,
        @Nombre = N'IPV (Polio)',
        @Descripcion = N'Protección contra la poliomielitis.',
        @PerteneceAlEsquema = 1,
        @EdadRecomendadaMeses = 2,
        @NumeroDosisEsquema = 3, -- Total of 3 doses in the series
        @IntervaloMesesSiguienteDosis = 2, -- Next dose is 2 months later
        @EsRefuerzo = 0,
        @OutputMessage = @OutputMessage OUTPUT,
        @New_id_Vacuna = @New_id_Vacuna OUTPUT;

    EXEC dbo.usp_AddVaccineToCatalog
        @id_Fabricante = 1,
        @Nombre = N'Neumococo',
        @Descripcion = N'Protección contra enfermedades graves producidas por el neumococo.',
        @PerteneceAlEsquema = 1,
        @EdadRecomendadaMeses = 2,
        @NumeroDosisEsquema = 2, -- 2 primary doses
        @IntervaloMesesSiguienteDosis = 2,
        @EsRefuerzo = 0,
        @OutputMessage = @OutputMessage OUTPUT,
        @New_id_Vacuna = @New_id_Vacuna OUTPUT;

    EXEC dbo.usp_AddVaccineToCatalog
        @id_Fabricante = 1,
        @Nombre = N'Pentavalente',
        @Descripcion = N'Protección contra difteria, tétanos, tosferina, hepatitis B y Haemophilus influenzae B.',
        @PerteneceAlEsquema = 1,
        @EdadRecomendadaMeses = 2,
        @NumeroDosisEsquema = 3,
        @IntervaloMesesSiguienteDosis = 2,
        @EsRefuerzo = 0,
        @OutputMessage = @OutputMessage OUTPUT,
        @New_id_Vacuna = @New_id_Vacuna OUTPUT;

    -- 6 Meses
    PRINT 'Adding vaccines for 6 months...';
    EXEC dbo.usp_AddVaccineToCatalog
        @id_Fabricante = 1,
        @Nombre = N'Influenza',
        @Descripcion = N'Protección contra la gripe estacional.',
        @PerteneceAlEsquema = 1,
        @EdadRecomendadaMeses = 6,
        @NumeroDosisEsquema = 2, -- Two initial doses
        @IntervaloMesesSiguienteDosis = 1, -- Second dose 1 month later
        @EsRefuerzo = 0,
        @OutputMessage = @OutputMessage OUTPUT,
        @New_id_Vacuna = @New_id_Vacuna OUTPUT;

    -- 12 Meses
    PRINT 'Adding vaccines for 12 months...';
    EXEC dbo.usp_AddVaccineToCatalog
        @id_Fabricante = 1,
        @Nombre = N'SRP',
        @Descripcion = N'Protección contra sarampión, rubéola y parotiditis (paperas).',
        @PerteneceAlEsquema = 1,
        @EdadRecomendadaMeses = 12,
        @NumeroDosisEsquema = 2,
        @IntervaloMesesSiguienteDosis = 6, -- Second dose at 18 months
        @EsRefuerzo = 0,
        @OutputMessage = @OutputMessage OUTPUT,
        @New_id_Vacuna = @New_id_Vacuna OUTPUT;

    EXEC dbo.usp_AddVaccineToCatalog
        @id_Fabricante = 1,
        @Nombre = N'Neumococo (Refuerzo)',
        @Descripcion = N'Refuerzo contra enfermedades graves producidas por el neumococo.',
        @PerteneceAlEsquema = 1,
        @EdadRecomendadaMeses = 12,
        @NumeroDosisEsquema = 1,
        @IntervaloMesesSiguienteDosis = NULL,
        @EsRefuerzo = 1,
        @OutputMessage = @OutputMessage OUTPUT,
        @New_id_Vacuna = @New_id_Vacuna OUTPUT;

    -- 18 Meses
    PRINT 'Adding vaccines for 18 months...';
    EXEC dbo.usp_AddVaccineToCatalog
        @id_Fabricante = 1,
        @Nombre = N'bOPV (Refuerzo Polio)',
        @Descripcion = N'Refuerzo contra la poliomielitis.',
        @PerteneceAlEsquema = 1,
        @EdadRecomendadaMeses = 18,
        @NumeroDosisEsquema = 1,
        @IntervaloMesesSiguienteDosis = NULL,
        @EsRefuerzo = 1,
        @OutputMessage = @OutputMessage OUTPUT,
        @New_id_Vacuna = @New_id_Vacuna OUTPUT;

    EXEC dbo.usp_AddVaccineToCatalog
        @id_Fabricante = 1,
        @Nombre = N'DPT (Refuerzo)',
        @Descripcion = N'Refuerzo contra difteria, tétanos y tosferina.',
        @PerteneceAlEsquema = 1,
        @EdadRecomendadaMeses = 18,
        @NumeroDosisEsquema = 1,
        @IntervaloMesesSiguienteDosis = NULL,
        @EsRefuerzo = 1,
        @OutputMessage = @OutputMessage OUTPUT,
        @New_id_Vacuna = @New_id_Vacuna OUTPUT;

    COMMIT TRANSACTION;
    PRINT 'Transaction committed. Vaccination schedule seeded successfully.';

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    
    PRINT 'An error occurred. Transaction rolled back.';
    -- Log the error details
    PRINT 'Error Number: ' + CAST(ERROR_NUMBER() AS NVARCHAR(10));
    PRINT 'Error Severity: ' + CAST(ERROR_SEVERITY() AS NVARCHAR(10));
    PRINT 'Error State: ' + CAST(ERROR_STATE() AS NVARCHAR(10));
    PRINT 'Error Procedure: ' + ISNULL(ERROR_PROCEDURE(), 'N/A');
    PRINT 'Error Line: ' + CAST(ERROR_LINE() AS NVARCHAR(10));
    PRINT 'Error Message: ' + ERROR_MESSAGE();
END CATCH
