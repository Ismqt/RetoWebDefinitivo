CREATE OR ALTER PROCEDURE dbo.usp_GetAllAppointments
    @id_Usuario INT,
    @RolName NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    -- Admins and Medicos can see all appointments
    IF @RolName IN ('Administrador', 'Medico')
    BEGIN
        SELECT
            c.id_Cita, c.Fecha, 
            FORMAT(c.Hora, 'HH:mm') AS Hora,
            COALESCE(n.Nombres + ' ' + n.Apellidos, t.Nombres + ' ' + t.Apellidos) AS NombrePaciente,
            v.Nombre AS NombreVacuna, cv.NombreCentro, ec.Estado AS EstadoCita
        FROM dbo.CitaVacunacion c
        LEFT JOIN dbo.Nino n ON c.id_Nino = n.id_Nino
        LEFT JOIN dbo.Tutor t ON c.id_UsuarioRegistraCita = t.id_Usuario
        JOIN dbo.Vacuna v ON c.id_Vacuna = v.id_Vacuna
        JOIN dbo.CentroVacunacion cv ON c.id_CentroVacunacion = cv.id_CentroVacunacion
        JOIN dbo.EstadoCita ec ON c.id_EstadoCita = ec.id_Estado
        ORDER BY c.Fecha DESC, c.Hora DESC;
    END
    -- Personal del Centro de Vacunación can see appointments for their assigned center
    ELSE IF @RolName = 'Personal del Centro de Vacunación'
    BEGIN
        DECLARE @id_CentroVacunacion INT;
        SELECT @id_CentroVacunacion = id_CentroVacunacion FROM dbo.Usuario WHERE id_Usuario = @id_Usuario;

        SELECT
            c.id_Cita, c.Fecha, 
            FORMAT(c.Hora, 'HH:mm') AS Hora,
            COALESCE(n.Nombres + ' ' + n.Apellidos, t.Nombres + ' ' + t.Apellidos) AS NombrePaciente,
            v.Nombre AS NombreVacuna, cv.NombreCentro, ec.Estado AS EstadoCita
        FROM dbo.CitaVacunacion c
        LEFT JOIN dbo.Nino n ON c.id_Nino = n.id_Nino
        LEFT JOIN dbo.Tutor t ON c.id_UsuarioRegistraCita = t.id_Usuario
        JOIN dbo.Vacuna v ON c.id_Vacuna = v.id_Vacuna
        JOIN dbo.CentroVacunacion cv ON c.id_CentroVacunacion = cv.id_CentroVacunacion
        JOIN dbo.EstadoCita ec ON c.id_EstadoCita = ec.id_Estado
        WHERE c.id_CentroVacunacion = @id_CentroVacunacion
        ORDER BY c.Fecha DESC, c.Hora DESC;
    END
    -- Tutors can see their own appointments and their children's appointments
    ELSE IF @RolName = 'Tutor'
    BEGIN
        SELECT
            c.id_Cita, c.Fecha, 
            FORMAT(c.Hora, 'HH:mm') AS Hora,
            COALESCE(n.Nombres + ' ' + n.Apellidos, t_self.Nombres + ' ' + t_self.Apellidos) AS NombrePaciente,
            v.Nombre AS NombreVacuna, cv.NombreCentro, ec.Estado AS EstadoCita
        FROM dbo.CitaVacunacion c
        LEFT JOIN dbo.Nino n ON c.id_Nino = n.id_Nino
        LEFT JOIN dbo.Tutor t_self ON c.id_UsuarioRegistraCita = t_self.id_Usuario
        LEFT JOIN dbo.TutorNino tn ON n.id_Nino = tn.id_Nino
        LEFT JOIN dbo.Tutor t_filter ON tn.id_Tutor = t_filter.id_Tutor
        JOIN dbo.Vacuna v ON c.id_Vacuna = v.id_Vacuna
        JOIN dbo.CentroVacunacion cv ON c.id_CentroVacunacion = cv.id_CentroVacunacion
        JOIN dbo.EstadoCita ec ON c.id_EstadoCita = ec.id_Estado
        WHERE t_filter.id_Usuario = @id_Usuario OR (c.id_Nino IS NULL AND c.id_UsuarioRegistraCita = @id_Usuario)
        ORDER BY c.Fecha DESC, c.Hora DESC;
    END
    ELSE
    BEGIN
        -- If role is not recognized or has no permissions, return an empty set.
        SELECT
            CAST(NULL AS INT) AS id_Cita,
            CAST(NULL AS DATE) AS Fecha,
            FORMAT(CAST(NULL AS TIME), 'HH:mm') AS Hora,
            CAST(NULL AS NVARCHAR(100)) AS NombrePaciente,
            CAST(NULL AS NVARCHAR(50)) AS NombreVacuna,
            CAST(NULL AS NVARCHAR(100)) AS NombreCentro,
            CAST(NULL AS NVARCHAR(50)) AS EstadoCita
        WHERE 1 = 0; -- This ensures the structure is returned but no rows
    END
END
GO
