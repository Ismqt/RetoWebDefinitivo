PRINT 'Creating Stored Procedure usp_GetVaccineLotsByCenter...';
GO

IF OBJECT_ID('dbo.usp_GetVaccineLotsByCenter', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE dbo.usp_GetVaccineLotsByCenter;
END
GO

CREATE PROCEDURE dbo.usp_GetVaccineLotsByCenter
    @id_CentroVacunacion INT
AS
BEGIN
    SET NOCOUNT ON;

    IF @id_CentroVacunacion IS NULL
    BEGIN
        RAISERROR('Error: @id_CentroVacunacion cannot be NULL.', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.CentroVacunacion WHERE id_CentroVacunacion = @id_CentroVacunacion)
    BEGIN
        RAISERROR('Error: Specified CentroVacunacion ID does not exist.', 16, 1);
        RETURN;
    END

    SELECT
        l.id_LoteVacuna,
        l.NumeroLote,
        v.Nombre AS NombreVacuna, -- Correct column name from 'Vacuna' table
        f.Fabricante AS NombreFabricante, -- Correct column name from 'Fabricante' table
        l.FechaCaducidad,
        NULL AS FechaRecepcion, -- No equivalent column found in Lote table, returning NULL
        l.CantidadInicial,
        l.CantidadDisponible,
        CASE
            WHEN l.CantidadDisponible > 0 AND l.FechaCaducidad >= GETDATE() THEN CAST(1 AS BIT)
            ELSE CAST(0 AS BIT)
        END AS Activo
    FROM
        dbo.Lote l
    INNER JOIN
        dbo.Vacuna v ON l.id_VacunaCatalogo = v.id_Vacuna
    INNER JOIN
        dbo.Fabricante f ON v.id_Fabricante = f.id_Fabricante
    WHERE
        l.id_CentroVacunacion = @id_CentroVacunacion
    ORDER BY
        Activo DESC, l.FechaCaducidad ASC;

END;
GO

PRINT 'Stored Procedure usp_GetVaccineLotsByCenter created/updated successfully.';
GO
