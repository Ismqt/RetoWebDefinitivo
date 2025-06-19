SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[usp_GetUserForAuth]
    @LoginIdentifier NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    -- Selects user information, including the hashed password (Clave),
    -- for authentication in the application layer.
    SELECT 
        u.id_Usuario,
        u.Email,
        u.Cedula_Usuario,
        u.Clave, -- Hashed password
        u.id_Rol,
        r.Rol AS NombreRol,
        u.id_Estado AS id_EstadoUsuario,
        es.Estado AS NombreEstado,
        u.id_CentroVacunacion
    FROM 
        dbo.Usuario u
    INNER JOIN 
        Rol r ON u.id_Rol = r.id_Rol
    INNER JOIN
        EstadoUsuario es ON u.id_Estado = es.id_Estado
    WHERE 
        (u.Email = @LoginIdentifier OR u.Cedula_Usuario = @LoginIdentifier)
        AND u.id_Estado = 1; -- Ensure user is active (1 = 'Activo')

END;
GO
