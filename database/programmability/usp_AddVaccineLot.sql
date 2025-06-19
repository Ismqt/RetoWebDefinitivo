PRINT 'Creating Stored Procedure usp_AddVaccineLot...';
GO

IF OBJECT_ID('dbo.usp_AddVaccineLot', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE dbo.usp_AddVaccineLot;
END
GO

CREATE PROCEDURE [dbo].[usp_AddVaccineLot]
    @id_VacunaCatalogo INT,
    @id_CentroVacunacion INT,
    @NumeroLote NVARCHAR(50),
    @FechaCaducidad DATE,
    @CantidadInicial INT,

    @OutputMessage NVARCHAR(255) OUTPUT,
    @New_id_LoteVacuna INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    -- Validations
    IF NOT EXISTS (SELECT 1 FROM dbo.Vacuna WHERE id_Vacuna = @id_VacunaCatalogo)
    BEGIN
        SET @OutputMessage = 'Error: Specified Vacuna (Vaccine Catalog) ID does not exist.';
        RAISERROR(@OutputMessage, 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.CentroVacunacion WHERE id_CentroVacunacion = @id_CentroVacunacion) -- Added validation
    BEGIN
        SET @OutputMessage = 'Error: Specified CentroVacunacion (Vaccination Center) ID does not exist.';
        RAISERROR(@OutputMessage, 16, 1);
        RETURN;
    END

    IF @CantidadInicial < 0
    BEGIN
        SET @OutputMessage = 'Error: CantidadInicial (Initial Quantity) cannot be negative.';
        RAISERROR(@OutputMessage, 16, 1);
        RETURN;
    END

    IF @FechaCaducidad < GETDATE()
    BEGIN
        SET @OutputMessage = 'Error: FechaCaducidad (Expiration Date) cannot be in the past.';
        RAISERROR(@OutputMessage, 16, 1);
        RETURN;
    END

    -- The UNIQUE constraint UQ_Lote_Centro_Vacuna_NumeroLote will handle duplicate check.
    -- However, we can provide a more user-friendly message if we check it here.
    IF EXISTS (SELECT 1 FROM dbo.Lote WHERE id_CentroVacunacion = @id_CentroVacunacion AND id_VacunaCatalogo = @id_VacunaCatalogo AND NumeroLote = @NumeroLote) -- Updated duplicate check
    BEGIN
        SET @OutputMessage = 'Error: A lot with this NumeroLote for the specified vaccine and vaccination center already exists.';
        RAISERROR(@OutputMessage, 16, 1);
        RETURN;
    END

    BEGIN TRANSACTION;

    BEGIN TRY
        INSERT INTO dbo.Lote (
            id_VacunaCatalogo, 
            id_CentroVacunacion, -- Added column
            NumeroLote, 
            FechaCaducidad, 
            CantidadInicial, 
            CantidadDisponible
        )
        VALUES (
            @id_VacunaCatalogo, 
            @id_CentroVacunacion, -- Added value
            @NumeroLote, 
            @FechaCaducidad, 
            @CantidadInicial, 
            @CantidadInicial -- CantidadDisponible is same as CantidadInicial on creation
        );

        SET @New_id_LoteVacuna = SCOPE_IDENTITY();

        COMMIT TRANSACTION;
        SET @OutputMessage = 'Vaccine lot added successfully. Lot ID: ' + CAST(@New_id_LoteVacuna AS NVARCHAR(10)) + '.';

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @CaughtErrorMessage NVARCHAR(4000);
        DECLARE @CaughtErrorSeverity INT;
        DECLARE @CaughtErrorState INT;
        DECLARE @CaughtErrorNumber INT;
        DECLARE @CaughtErrorProcedure NVARCHAR(128);
        DECLARE @CaughtErrorLine INT;

        SELECT 
            @CaughtErrorMessage = ERROR_MESSAGE(),
            @CaughtErrorSeverity = ERROR_SEVERITY(),
            @CaughtErrorState = ERROR_STATE(),
            @CaughtErrorNumber = ERROR_NUMBER(),
            @CaughtErrorProcedure = ERROR_PROCEDURE(),
            @CaughtErrorLine = ERROR_LINE();

        -- Set the output message with detailed error info
        SET @OutputMessage = 'Error adding vaccine lot: ' + ISNULL(@CaughtErrorMessage, 'Unknown error') + 
                             ' (Procedure: ' + ISNULL(@CaughtErrorProcedure, 'usp_AddVaccineLot') + 
                             ', Line: ' + ISNULL(CAST(@CaughtErrorLine AS NVARCHAR(10)), 'N/A') + ')';

        -- Customize message for known errors like unique constraint violation
        IF @CaughtErrorNumber = 2627 -- Unique constraint violation for UQ_Lote_Centro_Vacuna_NumeroLote
        BEGIN
            SET @OutputMessage = 'Error: A lot with NumeroLote ''' + @NumeroLote + ''' for Vacuna ID ' + CAST(@id_VacunaCatalogo AS NVARCHAR(10)) + ' and CentroVacunacion ID ' + CAST(@id_CentroVacunacion AS NVARCHAR(10)) + ' already exists. ' + ISNULL(@CaughtErrorMessage, '');
        END
        
        -- Re-raise the error using RAISERROR to ensure the client is notified
        -- Use the caught values to preserve the original error context as much as possible
        IF @CaughtErrorMessage IS NOT NULL AND @CaughtErrorSeverity IS NOT NULL AND @CaughtErrorState IS NOT NULL
        BEGIN
            RAISERROR (@CaughtErrorMessage, @CaughtErrorSeverity, @CaughtErrorState);
        END
        ELSE
        BEGIN
            -- Fallback if error functions somehow didn't return expected values (should not happen in a CATCH block)
            RAISERROR ('An unspecified error occurred in usp_AddVaccineLot CATCH block. Check @OutputMessage for details.', 16, 1);
        END
        
        -- Ensure the stored procedure exits after handling the error.
        RETURN;
    END CATCH
END;
GO

PRINT 'Stored Procedure usp_AddVaccineLot created/updated successfully.';
GO
