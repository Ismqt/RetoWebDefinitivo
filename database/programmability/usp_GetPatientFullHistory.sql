IF OBJECT_ID('dbo.usp_GetPatientFullHistory', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetPatientFullHistory;
GO

CREATE PROCEDURE dbo.usp_GetPatientFullHistory
    @id_Usuario INT,
    @id_Nino INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Determine the correct Tutor ID based on the input user ID
    DECLARE @id_Tutor INT;
    SELECT @id_Tutor = id_Tutor FROM dbo.Tutor WHERE id_Usuario = @id_Usuario;

    -- First, check if a medical history record exists for the given context
    IF NOT EXISTS (
        SELECT 1
        FROM dbo.HistoricoVacunas hv
        WHERE 
            (@id_Nino IS NOT NULL AND hv.id_Nino = @id_Nino) OR
            (@id_Nino IS NULL AND hv.id_Tutor = @id_Tutor)
    )
    BEGIN
        -- Return empty result sets with the correct structure to indicate no history
        SELECT TOP 0 id_Historico, id_Nino, id_Tutor, CAST(NULL AS NVARCHAR(201)) AS NombrePaciente, CAST(NULL AS DATE) AS FechaNacimiento, CAST(NULL AS INT) AS EdadActual, NotasAdicionales, Alergias, FechaCreacion FROM dbo.HistoricoVacunas;
        SELECT TOP 0 id_Historico, id_Cita, Vacuna, NombreCompletoPersonal, CAST(NULL AS NVARCHAR(50)) as NumeroLote, CentroMedico, Fecha AS FechaAplicacion, Hora AS HoraAplicacion, Notas, CAST(NULL AS DATE) AS FechaCita, CAST(NULL AS TIME) AS HoraCita, CAST(NULL AS INT) AS DosisLimite, CAST(NULL AS BIGINT) AS NumeroDosis FROM dbo.HistoricoCita;
        RETURN;
    END

    -- Get the main medical history record(s)
    SELECT 
        hv.id_Historico,
        hv.id_Nino,
        hv.id_Tutor,
        CASE 
            WHEN @id_Nino IS NOT NULL THEN n.Nombres + ' ' + n.Apellidos
            ELSE t.Nombres + ' ' + t.Apellidos
        END AS NombrePaciente,
        n.FechaNacimiento,
        DATEDIFF(YEAR, n.FechaNacimiento, GETDATE()) AS EdadActual,
        hv.NotasAdicionales,
        hv.Alergias,
        hv.FechaCreacion
    FROM dbo.HistoricoVacunas hv
    LEFT JOIN dbo.Nino n ON hv.id_Nino = n.id_Nino
    LEFT JOIN dbo.Tutor t ON hv.id_Tutor = t.id_Tutor
    WHERE 
        (@id_Nino IS NOT NULL AND hv.id_Nino = @id_Nino) OR
        (@id_Nino IS NULL AND hv.id_Tutor = @id_Tutor);

    -- Get detailed vaccination history
    SELECT 
        hv.id_Historico,
        hc.id_Cita,
        hc.Vacuna,
        -- Prioritize the manually entered name, but fall back to the user's name from the Usuario table
        ISNULL(cv.NombreCompletoPersonalAplicado, u.Nombre + ' ' + u.Apellido) AS NombreCompletoPersonal,
        l.NumeroLote, 
        hc.CentroMedico,
        hc.Fecha AS FechaAplicacion,
        hc.Hora AS HoraAplicacion,
        hc.Notas,
        cv.Fecha AS FechaCita,
        cv.Hora AS HoraCita,
        v.DosisLimite,
        ROW_NUMBER() OVER (PARTITION BY cv.id_Vacuna ORDER BY hc.Fecha ASC, hc.Hora ASC) AS NumeroDosis
    FROM dbo.HistoricoVacunas hv
    JOIN dbo.HistoricoCita hc ON hv.id_Historico = hc.id_Historico
    JOIN dbo.CitaVacunacion cv ON hc.id_Cita = cv.id_Cita
    JOIN dbo.Vacuna v ON cv.id_Vacuna = v.id_Vacuna
    LEFT JOIN dbo.Usuario u ON cv.id_PersonalSalud = u.id_Usuario 
    LEFT JOIN dbo.Lote l ON cv.id_LoteAplicado = l.id_LoteVacuna 
    WHERE 
        (@id_Nino IS NOT NULL AND cv.id_Nino = @id_Nino) OR
        (@id_Nino IS NULL AND cv.id_UsuarioRegistraCita = @id_Usuario)
    ORDER BY hc.Fecha DESC, hc.Hora DESC;
END
GO
