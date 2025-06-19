ALTER PROCEDURE [dbo].[usp_GetAllAppointments]
    @id_Usuario INT,
    @id_Rol INT  -- Cambiado de RolName a id_Rol para mejor práctica
AS
BEGIN
    SET NOCOUNT ON;

    -- Declarar constantes para los IDs de roles (ajusta según tu tabla Rol)
    DECLARE @RolAdministrador INT = 1;      -- Ajustar según tu BD
    DECLARE @RolMedico INT = 2;             -- Ajustar según tu BD  
    DECLARE @RolPersonalCentro INT = 6;     -- Ajustar según tu BD
    DECLARE @RolTutor INT = 5;              -- Ajustar según tu BD

    -- Admins and Medicos can see all appointments
    IF @id_Rol IN (@RolAdministrador, @RolMedico)
    BEGIN
        SELECT
            c.id_Cita, 
            c.Fecha, 
            CONVERT(VARCHAR(8), c.Hora, 108) AS Hora,  -- Formato HH:MM:SS
            CASE 
                WHEN c.id_Nino IS NOT NULL THEN n.Nombres + ' ' + n.Apellidos
                ELSE t.Nombres + ' ' + t.Apellidos 
            END AS NombrePaciente,
            v.Nombre AS NombreVacuna, 
            cv.NombreCentro, 
            ec.Estado AS EstadoCita,
            c.RequiereTutor,
            c.NombreCompletoPersonalAplicado
        FROM dbo.CitaVacunacion c
        LEFT JOIN dbo.Nino n ON c.id_Nino = n.id_Nino
        LEFT JOIN dbo.Tutor t ON c.id_UsuarioRegistraCita = t.id_Usuario
        INNER JOIN dbo.Vacuna v ON c.id_Vacuna = v.id_Vacuna
        INNER JOIN dbo.CentroVacunacion cv ON c.id_CentroVacunacion = cv.id_CentroVacunacion
        INNER JOIN dbo.EstadoCita ec ON c.id_EstadoCita = ec.id_Estado
        ORDER BY c.Fecha DESC, c.Hora DESC;
    END
    -- Personal del Centro de Vacunación can see appointments for their assigned center
    ELSE IF @id_Rol = @RolPersonalCentro
    BEGIN
        DECLARE @id_CentroVacunacion INT;
        
        -- Obtener el centro de vacunación del usuario
        SELECT @id_CentroVacunacion = id_CentroVacunacion 
        FROM dbo.Usuario 
        WHERE id_Usuario = @id_Usuario;

        -- Validar que el usuario tenga un centro asignado
        IF @id_CentroVacunacion IS NOT NULL
        BEGIN
            SELECT
                c.id_Cita, 
                c.Fecha, 
                CONVERT(VARCHAR(8), c.Hora, 108) AS Hora,  -- Formato HH:MM:SS
                CASE 
                    WHEN c.id_Nino IS NOT NULL THEN n.Nombres + ' ' + n.Apellidos
                    ELSE t.Nombres + ' ' + t.Apellidos 
                END AS NombrePaciente,
                v.Nombre AS NombreVacuna, 
                cv.NombreCentro, 
                ec.Estado AS EstadoCita,
                c.RequiereTutor,
                c.NombreCompletoPersonalAplicado
            FROM dbo.CitaVacunacion c
            LEFT JOIN dbo.Nino n ON c.id_Nino = n.id_Nino
            LEFT JOIN dbo.Tutor t ON c.id_UsuarioRegistraCita = t.id_Usuario
            INNER JOIN dbo.Vacuna v ON c.id_Vacuna = v.id_Vacuna
            INNER JOIN dbo.CentroVacunacion cv ON c.id_CentroVacunacion = cv.id_CentroVacunacion
            INNER JOIN dbo.EstadoCita ec ON c.id_EstadoCita = ec.id_Estado
            WHERE c.id_CentroVacunacion = @id_CentroVacunacion
            ORDER BY c.Fecha DESC, c.Hora DESC;
        END
        ELSE
        BEGIN
            -- Usuario sin centro asignado, retornar estructura vacía
            SELECT
                CAST(NULL AS INT) AS id_Cita,
                CAST(NULL AS DATE) AS Fecha,
                CAST(NULL AS VARCHAR(8)) AS Hora,
                CAST(NULL AS NVARCHAR(200)) AS NombrePaciente,
                CAST(NULL AS NVARCHAR(100)) AS NombreVacuna,
                CAST(NULL AS NVARCHAR(100)) AS NombreCentro,
                CAST(NULL AS NVARCHAR(50)) AS EstadoCita,
                CAST(NULL AS BIT) AS RequiereTutor,
                CAST(NULL AS NVARCHAR(100)) AS NombreCompletoPersonalAplicado
            WHERE 1 = 0;
        END
    END
    -- Tutors can see their own appointments and their children's appointments
    ELSE IF @id_Rol = @RolTutor
    BEGIN
        SELECT
            c.id_Cita, 
            c.Fecha, 
            CONVERT(VARCHAR(8), c.Hora, 108) AS Hora,  -- Formato HH:MM:SS
            CASE 
                WHEN c.id_Nino IS NOT NULL THEN n.Nombres + ' ' + n.Apellidos
                ELSE t_self.Nombres + ' ' + t_self.Apellidos 
            END AS NombrePaciente,
            v.Nombre AS NombreVacuna, 
            cv.NombreCentro, 
            ec.Estado AS EstadoCita,
            c.RequiereTutor,
            c.NombreCompletoPersonalAplicado
        FROM dbo.CitaVacunacion c
        LEFT JOIN dbo.Nino n ON c.id_Nino = n.id_Nino
        LEFT JOIN dbo.Tutor t_self ON c.id_UsuarioRegistraCita = t_self.id_Usuario
        LEFT JOIN dbo.TutorNino tn ON n.id_Nino = tn.id_Nino
        LEFT JOIN dbo.Tutor t_filter ON tn.id_Tutor = t_filter.id_Tutor
        INNER JOIN dbo.Vacuna v ON c.id_Vacuna = v.id_Vacuna
        INNER JOIN dbo.CentroVacunacion cv ON c.id_CentroVacunacion = cv.id_CentroVacunacion
        INNER JOIN dbo.EstadoCita ec ON c.id_EstadoCita = ec.id_Estado
        WHERE t_filter.id_Usuario = @id_Usuario 
           OR (c.id_Nino IS NULL AND c.id_UsuarioRegistraCita = @id_Usuario)
        ORDER BY c.Fecha DESC, c.Hora DESC;
    END
    ELSE
    BEGIN
        -- If role is not recognized or has no permissions, return empty structure
        SELECT
            CAST(NULL AS INT) AS id_Cita,
            CAST(NULL AS DATE) AS Fecha,
            CAST(NULL AS VARCHAR(8)) AS Hora,
            CAST(NULL AS NVARCHAR(200)) AS NombrePaciente,
            CAST(NULL AS NVARCHAR(100)) AS NombreVacuna,
            CAST(NULL AS NVARCHAR(100)) AS NombreCentro,
            CAST(NULL AS NVARCHAR(50)) AS EstadoCita,
            CAST(NULL AS BIT) AS RequiereTutor,
            CAST(NULL AS NVARCHAR(100)) AS NombreCompletoPersonalAplicado
        WHERE 1 = 0;
    END
END
GO
