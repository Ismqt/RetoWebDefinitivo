CREATE OR ALTER PROCEDURE [dbo].[usp_CreateUser]
    @id_Rol INT,
    @Cedula_Usuario NVARCHAR(15),
    @Email NVARCHAR(100),
    @Clave NVARCHAR(255),
    @Nombre NVARCHAR(50),
    @Apellido NVARCHAR(50),
    @id_CentroVacunacion INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 1. Validate input parameters are not null
    IF @id_Rol IS NULL OR @Cedula_Usuario IS NULL OR @Email IS NULL OR @Clave IS NULL OR @Nombre IS NULL OR @Apellido IS NULL
    BEGIN
        RAISERROR('Input parameters (Role, Cedula, Email, Password, Nombre, Apellido) cannot be null.', 16, 1);
        RETURN;
    END

    -- 2. Check for duplicate user
    IF EXISTS (SELECT 1 FROM Usuario WHERE Email = @Email OR Cedula_Usuario = @Cedula_Usuario)
    BEGIN
        RAISERROR('User with the provided Email or Cedula already exists.', 16, 1);
        RETURN;
    END

    -- 3. Validate Foreign Key: id_Rol
    IF NOT EXISTS (SELECT 1 FROM Rol WHERE id_Rol = @id_Rol)
    BEGIN
        RAISERROR('The specified Role ID does not exist.', 16, 1);
        RETURN;
    END

    -- 4. Business Rule: if role is 'Personal' (ID 6), center must be provided.
    IF @id_Rol = 6 AND @id_CentroVacunacion IS NULL
    BEGIN
        RAISERROR('A Vaccination Center must be assigned for this user role.', 16, 1);
        RETURN;
    END

    -- 5. Business Rule: if role is NOT 'Personal', center must be NULL.
    IF @id_Rol != 6 AND @id_CentroVacunacion IS NOT NULL
    BEGIN
        RAISERROR('A Vaccination Center cannot be assigned for this user role.', 16, 1);
        RETURN;
    END

    -- 6. Validate Foreign Key: id_CentroVacunacion (only if it's not null)
    IF @id_CentroVacunacion IS NOT NULL AND NOT EXISTS (SELECT 1 FROM CentroVacunacion WHERE id_CentroVacunacion = @id_CentroVacunacion)
    BEGIN
        RAISERROR('The specified Vaccination Center ID does not exist.', 16, 1);
        RETURN;
    END

    -- All checks passed, proceed with insert
    INSERT INTO Usuario (id_Rol, id_Estado, Cedula_Usuario, Email, Clave, Nombre, Apellido, id_CentroVacunacion)
    VALUES (@id_Rol, 1, @Cedula_Usuario, @Email, @Clave, @Nombre, @Apellido, @id_CentroVacunacion); -- Default state 1 = 'Activo'

    -- Return the ID of the newly created user
    SELECT SCOPE_IDENTITY() AS id_Usuario;
END
GO
