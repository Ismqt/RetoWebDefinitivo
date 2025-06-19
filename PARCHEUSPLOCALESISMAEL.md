# Reporte de Parches para Procedimientos Almacenados (USP)

Este documento contiene los scripts de SQL para los procedimientos almacenados que fueron creados o actualizados.

---

## 1. `usp_AddVaccineToCatalog`

Este procedimiento almacenado se **creó** para manejar la inserción de nuevas vacunas en el catálogo. Incluye validaciones para el fabricante, el nombre de la vacuna y maneja las transacciones de manera segura. Devuelve un mensaje de salida y el ID de la nueva vacuna.

```sql
-- Script para crear el procedimiento almacenado dbo.usp_AddVaccineToCatalog
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
    @DosisLimite INT = NULL,         -- Optional parameter
    @Tipo NVARCHAR(50) = NULL,      -- Optional parameter
    @Descripcion NVARCHAR(MAX) = NULL, -- Optional parameter
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

    -- Optional: Check for existing vaccine with the same name and manufacturer
    IF EXISTS (SELECT 1 FROM dbo.Vacuna WHERE Nombre = @Nombre AND id_Fabricante = @id_Fabricante)
    BEGIN
        SET @OutputMessage = 'Error: A vaccine with the same name and manufacturer already exists.';
        RAISERROR(@OutputMessage, 16, 1);
        RETURN;
    END

    BEGIN TRANSACTION;

    BEGIN TRY
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
```

---

## 2. `usp_GetAllVaccines`

Este procedimiento almacenado se **actualizó** para incluir el nombre del fabricante en los resultados. Se modificó para realizar un `LEFT JOIN` con la tabla `Fabricante` y devolver el campo `NombreFabricante`.

```sql
-- Script para actualizar el procedimiento almacenado dbo.usp_GetAllVaccines
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
```
