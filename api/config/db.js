const sql = require("mssql")

// Configuraciones múltiples para probar
const configs = {
  // Opción 1: Usuario SQL (RECOMENDADO)
  sqlAuth: {
    server: "ISMA_LEGION\\\\SQLEXPRESS",
    database: "Vaccine",
    user: "vaccine_api",
    password: "VaccineAPI2024!",
    port: 1433,
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
      instanceName: "SQLEXPRESS",
      requestTimeout: 30000,
      connectionTimeout: 30000,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  },

  // Opción 2: Windows Authentication con credenciales específicas
  windowsAuth: {
    server: "ISMA_LEGION\\\\SQLEXPRESS",
    database: "Vaccine",
    domain: "ISMA_LEGION", // Tu dominio/computadora
    userName: "ismae", // Tu usuario de Windows
    password: "", // Déjalo vacío para Windows Auth
    port: 1433,
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
      instanceName: "SQLEXPRESS",
      requestTimeout: 30000,
      connectionTimeout: 30000,
      useUTC: false,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  },

  // Opción 3: Connection string con usuario SQL
  sqlAuthString:
    "Server=ISMA_LEGION\\\\SQLEXPRESS,1433;Database=Vaccine;User Id=vaccine_api;Password=VaccineAPI2024!;Encrypt=false;TrustServerCertificate=true;Connection Timeout=30;",

  // Opción 4: Connection string Windows Auth mejorado
  windowsAuthString:
    "Server=ISMA_LEGION\\\\SQLEXPRESS,1433;Database=Vaccine;Integrated Security=true;Encrypt=false;TrustServerCertificate=true;Connection Timeout=30;Persist Security Info=false;",
}

// Connection string adaptado - usando SQL Authentication que ya funciona
const connectionString =
  "Server=ISMA_LEGION\\\\SQLEXPRESS,1433;Database=Vaccine;User Id=vaccine_api;Password=VaccineAPI2024!;Encrypt=false;TrustServerCertificate=true;Connection Timeout=30;"

// Pool de conexiones usando tu estructura original
const poolPromise = new sql.ConnectionPool(connectionString)
  .connect()
  .then((pool) => {
    console.log("[DB SUCCESS] ✅ Connected to SQL Server successfully using connection string!")
    console.log("[DB INFO] 📊 Database: Vaccine | User: vaccine_api")
    return pool
  })
  .catch((err) => {
    console.error("[DB FAILED] ❌ Database Connection Failed using Connection String! Details: ", err.message)
    console.error("[DB DEBUG] 🔍 Attempted Connection String:", connectionString.replace("VaccineAPI2024!", "***"))
    throw err
  })

let pool

const connectDB = async () => {
  try {
    console.log("[DB INFO] 🔄 Intentando conectar a SQL Server...")

    // Probar configuraciones en orden de preferencia
    const configOrder = [
      { name: "SQL Authentication (Config)", config: configs.sqlAuth },
      { name: "SQL Authentication (String)", config: configs.sqlAuthString },
      { name: "Windows Authentication (Config)", config: configs.windowsAuth },
      { name: "Windows Authentication (String)", config: configs.windowsAuthString },
    ]

    for (const { name, config } of configOrder) {
      try {
        console.log(`[DB INFO] 🔍 Probando: ${name}...`)

        if (typeof config === "string") {
          pool = await sql.connect(config)
        } else {
          pool = await sql.connect(config)
        }

        console.log(`[DB SUCCESS] ✅ ¡Conectado exitosamente usando: ${name}!`)

        // Probar una consulta simple para verificar
        const testResult = await pool.request().query("SELECT @@VERSION as version")
        console.log(`[DB INFO] 📊 Versión del servidor: ${testResult.recordset[0].version.substring(0, 50)}...`)

        return pool
      } catch (err) {
        console.log(`[DB INFO] ❌ ${name} falló: ${err.message}`)
        if (pool) {
          try {
            await pool.close()
          } catch (closeErr) {
            // Ignorar errores de cierre
          }
          pool = null
        }
        continue
      }
    }

    throw new Error("❌ Todas las opciones de conexión fallaron")
  } catch (err) {
    console.error("[DB ERROR] 💥 Error de conexión:", err.message)
    throw err
  }
}

const getPool = () => {
  if (!pool) {
    throw new Error("❌ Base de datos no conectada. Llama a connectDB() primero.")
  }
  return pool
}

const closeDB = async () => {
  if (pool) {
    try {
      await pool.close()
      pool = null
      console.log("[DB INFO] 🔒 Conexión cerrada correctamente")
    } catch (err) {
      console.error("[DB ERROR] Error cerrando conexión:", err.message)
    }
  }
}

module.exports = {
  sql,
  connectDB,
  getPool,
  closeDB,
  poolPromise,
}
