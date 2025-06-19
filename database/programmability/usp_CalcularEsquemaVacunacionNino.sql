-- Stored Procedure to calculate the pending vaccination schedule for a child
-- Author: Cascade
-- Date: 2025-06-19

CREATE OR ALTER PROCEDURE dbo.usp_CalcularEsquemaVacunacionNino
    @id_Nino INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Temp table to store the final schedule to be returned
    CREATE TABLE #EsquemaCalculado (
        id_Vacuna INT,
        NombreVacuna NVARCHAR(100),
        DosisPorAplicar INT,
        FechaSugerida DATE,
        Estado NVARCHAR(50),
        Criterio NVARCHAR(50)
    );

    -- 1. Get child's birth date
    DECLARE @FechaNacimiento DATE;
    SELECT @FechaNacimiento = FechaNacimiento FROM dbo.Nino WHERE id_Nino = @id_Nino;

    IF @FechaNacimiento IS NULL
    BEGIN
        -- Child not found, return empty result
        SELECT * FROM #EsquemaCalculado;
        RETURN;
    END

    -- 2. Get the ID for the 'Asistida' (Attended) appointment status
    DECLARE @id_EstadoAsistida INT;
    SELECT @id_EstadoAsistida = id_Estado FROM dbo.EstadoCita WHERE Estado = 'Asistida';

    -- 3. Get all administered vaccines for the child
    CREATE TABLE #DosisAdministradas (
        id_Vacuna INT,
        FechaAplicacion DATE,
        DosisNumero INT
    );

    INSERT INTO #DosisAdministradas (id_Vacuna, FechaAplicacion, DosisNumero)
    SELECT 
        id_Vacuna,
        Fecha,
        ROW_NUMBER() OVER(PARTITION BY id_Vacuna ORDER BY Fecha ASC) as DosisNumero
    FROM dbo.CitaVacunacion
    WHERE id_Nino = @id_Nino AND id_EstadoCita = @id_EstadoAsistida;

    -- 4. Iterate through the official vaccination schedule to find pending doses
    DECLARE @id_EsquemaVacuna INT, @id_Vacuna_Esquema INT, @EdadRecomendadaMeses INT, 
            @IntervaloMesesSiguienteDosis INT, @NumeroDosis INT, @EsRefuerzo BIT;

    DECLARE esquema_cursor CURSOR FOR
    SELECT id_EsquemaVacuna, id_Vacuna, EdadRecomendadaMeses, IntervaloMesesSiguienteDosis, NumeroDosis, EsRefuerzo
    FROM dbo.EsquemaVacunacion;

    OPEN esquema_cursor;
    FETCH NEXT FROM esquema_cursor INTO @id_EsquemaVacuna, @id_Vacuna_Esquema, @EdadRecomendadaMeses, 
                                      @IntervaloMesesSiguienteDosis, @NumeroDosis, @EsRefuerzo;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        DECLARE @DosisAdministradasCount INT;
        SELECT @DosisAdministradasCount = COUNT(*) FROM #DosisAdministradas WHERE id_Vacuna = @id_Vacuna_Esquema;

        -- If not all doses for this vaccine have been administered
        IF @DosisAdministradasCount < @NumeroDosis
        BEGIN
            DECLARE @FechaSugerida DATE;
            DECLARE @Criterio NVARCHAR(50);
            DECLARE @DosisPorAplicar INT = @DosisAdministradasCount + 1;

            -- Calculate the suggested date for the NEXT dose
            IF @DosisAdministradasCount = 0
            BEGIN
                -- This is the first dose, based on age
                SET @FechaSugerida = DATEADD(month, @EdadRecomendadaMeses, @FechaNacimiento);
                SET @Criterio = 'Edad';
            END
            ELSE
            BEGIN
                -- This is a subsequent dose, based on interval
                DECLARE @FechaUltimaDosis DATE;
                SELECT @FechaUltimaDosis = FechaAplicacion 
                FROM #DosisAdministradas 
                WHERE id_Vacuna = @id_Vacuna_Esquema AND DosisNumero = @DosisAdministradasCount;

                IF @IntervaloMesesSiguienteDosis IS NOT NULL AND @FechaUltimaDosis IS NOT NULL
                BEGIN
                    SET @FechaSugerida = DATEADD(month, @IntervaloMesesSiguienteDosis, @FechaUltimaDosis);
                    SET @Criterio = 'Intervalo';
                END
                ELSE
                BEGIN
                    -- Fallback if interval is not defined, should not happen for multi-dose vaccines
                    SET @FechaSugerida = DATEADD(month, @EdadRecomendadaMeses, @FechaNacimiento);
                    SET @Criterio = 'Edad (Fallback)';
                END
            END

            -- Determine the status
            DECLARE @Estado NVARCHAR(50);
            IF @FechaSugerida < GETDATE()
                SET @Estado = 'Vencida';
            ELSE IF @FechaSugerida <= DATEADD(day, 30, GETDATE())
                SET @Estado = 'Proxima';
            ELSE
                SET @Estado = 'Pendiente';

            -- Insert the calculated dose into our results table
            INSERT INTO #EsquemaCalculado (id_Vacuna, NombreVacuna, DosisPorAplicar, FechaSugerida, Estado, Criterio)
            SELECT @id_Vacuna_Esquema, v.Nombre, @DosisPorAplicar, @FechaSugerida, @Estado, @Criterio
            FROM dbo.Vacuna v WHERE v.id_Vacuna = @id_Vacuna_Esquema;

        END

        FETCH NEXT FROM esquema_cursor INTO @id_EsquemaVacuna, @id_Vacuna_Esquema, @EdadRecomendadaMeses, 
                                          @IntervaloMesesSiguienteDosis, @NumeroDosis, @EsRefuerzo;
    END

    CLOSE esquema_cursor;
    DEALLOCATE esquema_cursor;

    -- 5. Return the results
    SELECT * FROM #EsquemaCalculado ORDER BY FechaSugerida ASC;

    -- Clean up temp tables
    DROP TABLE #DosisAdministradas;
    DROP TABLE #EsquemaCalculado;

END
GO

PRINT 'Stored procedure usp_CalcularEsquemaVacunacionNino created successfully.';
GO
