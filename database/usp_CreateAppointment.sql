-- Stored Procedure: usp_CreateAppointment
-- Description: Creates a new appointment in the Citas table.
-- Parameters:
--   @id_Usuario: The ID of the user (tutor) creating the appointment.
--   @id_Nino: The ID of the child for whom the appointment is being made (can be NULL).
--   @id_Vacuna: The ID of the vaccine.
--   @id_CentroVacunacion: The ID of the vaccination center.
--   @Fecha: The date of the appointment.
--   @Hora: The time of the appointment.

IF OBJECT_ID('dbo.usp_CreateAppointment', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_CreateAppointment;
GO

CREATE PROCEDURE dbo.usp_CreateAppointment
    @id_Usuario INT,
    @id_Nino INT = NULL,
    @id_Vacuna INT,
    @id_CentroVacunacion INT,
    @Fecha DATE,
    @Hora VARCHAR(8)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @id_EstadoCita_Agendada INT;
    DECLARE @HoraTime TIME;

    -- Get the ID for the 'Agendada' status
    -- This makes the procedure resilient to changes in status IDs.
    SELECT @id_EstadoCita_Agendada = id_Estado
    FROM dbo.EstadoCita
    WHERE Estado = 'Agendada';

    -- If the 'Agendada' status is not found, raise an error.
    IF @id_EstadoCita_Agendada IS NULL
    BEGIN
        RAISERROR('El estado de cita "Agendada" no se encuentra en la tabla EstadoCita. No se puede crear la cita.', 16, 1);
        RETURN;
    END;

    -- Convert @Hora to TIME
    SET @HoraTime = CONVERT(TIME, @Hora);

    -- Insert the new appointment record
    INSERT INTO dbo.CitaVacunacion (
        id_UsuarioRegistraCita, -- Corrected column name
        id_Nino,
        id_Vacuna,
        id_CentroVacunacion,
        Fecha,
        Hora,
        id_EstadoCita
        -- The 'FechaCreacion' column does not exist in this table.
    )
    VALUES (
        @id_Usuario, -- This parameter from the API maps to id_UsuarioRegistraCita
        @id_Nino,
        @id_Vacuna,
        @id_CentroVacunacion,
        @Fecha,
        @HoraTime,
        @id_EstadoCita_Agendada
    );
END;
GO
