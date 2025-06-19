IF OBJECT_ID('dbo.usp_GetAllVaccines', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE dbo.usp_GetAllVaccines;
END
GO

CREATE PROCEDURE dbo.usp_GetAllVaccines
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        v.id_Vacuna,
        v.id_Fabricante,
        v.Nombre,
        v.DosisLimite,
        v.Tipo,
        v.Descripcion,
        f.Fabricante AS NombreFabricante -- Joining and aliasing the manufacturer's name
    FROM 
        dbo.Vacuna v
    LEFT JOIN 
        dbo.Fabricante f ON v.id_Fabricante = f.id_Fabricante;

END;
GO
