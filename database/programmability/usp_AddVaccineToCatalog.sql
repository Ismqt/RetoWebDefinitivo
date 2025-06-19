PRINT 'Creating Stored Procedure usp_AddVaccineToCatalog...';
GO

IF OBJECT_ID('dbo.usp_AddVaccineToCatalog', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE dbo.usp_AddVaccineToCatalog;
END
GO

CREATE PROCEDURE dbo.usp_AddVaccineToCatalog
    @id_Fabricante INT,
    @Nombre NVARCHAR(100),
    @DosisLimite INT = NULL,
    @Tipo NVARCHAR(50) = NULL,
    @Descripcion NVARCHAR(MAX) = NULL,
    -- Parameters for the childhood vaccination schedule
    @PerteneceAlEsquema BIT = 0,
    @EdadRecomendadaMeses INT = NULL,
    @IntervaloMesesSiguienteDosis INT = NULL,
    @NumeroDosisEsquema INT = NULL,
    @EsRefuerzo BIT = 0,
    -- Output parameters
    @OutputMessage NVARCHAR(255) OUTPUT,
    @New_id_Vacuna INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    -- Validations
    IF NOT EXISTS (SELECT 1 FROM dbo.Fabricante WHERE id_Fabricante = @id_Fabricante)
    BEGIN
        SET @OutputMessage = 'Error: Specified Fabricante (Manufacturer) ID does not exist.';
        RAISERROR(@OutputMessage, 16, 1);
        RETURN;
    END

    IF ISNULL(LTRIM(RTRIM(@Nombre)), '') = ''
    BEGIN
        SET @OutputMessage = 'Error: Nombre (Vaccine Name) cannot be empty.';
        RAISERROR(@OutputMessage, 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM dbo.Vacuna WHERE Nombre = @Nombre AND id_Fabricante = @id_Fabricante)
    BEGIN
        SET @OutputMessage = 'Error: A vaccine with the same name and manufacturer already exists.';
        RAISERROR(@OutputMessage, 16, 1);
        RETURN;
    END

    -- If it belongs to the schedule, validate required fields
    IF @PerteneceAlEsquema = 1 AND (@EdadRecomendadaMeses IS NULL OR @NumeroDosisEsquema IS NULL)
    BEGIN
        SET @OutputMessage = 'Error: For a schedule vaccine, EdadRecomendadaMeses and NumeroDosisEsquema are required.';
        RAISERROR(@OutputMessage, 16, 1);
        RETURN;
    END

    BEGIN TRANSACTION;

    BEGIN TRY
        -- Insert into the main vaccine catalog
        INSERT INTO dbo.Vacuna (
            id_Fabricante,
            Nombre,
            DosisLimite,
            Tipo,
            Descripcion
        )
        VALUES (
            @id_Fabricante,
            @Nombre,
            @DosisLimite,
            @Tipo,
            @Descripcion
        );

        SET @New_id_Vacuna = SCOPE_IDENTITY();

        -- If it's part of the childhood schedule, insert into EsquemaVacunacion
        IF @PerteneceAlEsquema = 1
        BEGIN
            INSERT INTO dbo.EsquemaVacunacion (
                id_Vacuna,
                EdadRecomendadaMeses,
                IntervaloMesesSiguienteDosis,
                NumeroDosis,
                EsRefuerzo
            )
            VALUES (
                @New_id_Vacuna,
                @EdadRecomendadaMeses,
                @IntervaloMesesSiguienteDosis,
                @NumeroDosisEsquema,
                @EsRefuerzo
            );
        END

        COMMIT TRANSACTION;
        SET @OutputMessage = 'Vaccine catalog entry added successfully. Vaccine ID: ' + CAST(@New_id_Vacuna AS NVARCHAR(10)) + '.';

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @CaughtErrorMessage NVARCHAR(4000);
        DECLARE @CaughtErrorSeverity INT;
        DECLARE @CaughtErrorState INT;

        SELECT 
            @CaughtErrorMessage = ERROR_MESSAGE(),
            @CaughtErrorSeverity = ERROR_SEVERITY(),
            @CaughtErrorState = ERROR_STATE();

        SET @OutputMessage = 'Error adding vaccine catalog entry: ' + ISNULL(@CaughtErrorMessage, 'Unknown error');
        
        RAISERROR (@OutputMessage, @CaughtErrorSeverity, @CaughtErrorState);
        RETURN;
    END CATCH
END;
GO

PRINT 'Stored Procedure usp_AddVaccineToCatalog created successfully.';
GO
