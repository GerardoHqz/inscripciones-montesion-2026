# ==============================================================================
# Script de Backup Automático para Tabla 'inscripciones' - Monte Sión 2026
# ==============================================================================
[System.Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Obtener directorio del script y archivo .env
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectDir = (Get-Item "$ScriptDir\..").FullName
$EnvPath = Join-Path $ProjectDir ".env"

if (-not (Test-Path $EnvPath)) {
    $EnvPath = Join-Path $ScriptDir ".env"
}

if (-not (Test-Path $EnvPath)) {
    Write-Error "No se encontró el archivo .env en $EnvPath"
    exit 1
}

# Leer variables del .env
$SupabaseUrl = ""
$SupabaseKey = ""

Get-Content $EnvPath -Encoding UTF8 | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#")) {
        $parts = $line.Split("=", 2)
        if ($parts.Count -eq 2) {
            $key = $parts[0].Trim()
            $val = $parts[1].Trim().Trim('"').Trim("'")
            if ($key -eq "VITE_SUPABASE_URL") { $SupabaseUrl = $val }
            if ($key -eq "VITE_SUPABASE_PUBLISHABLE_KEY" -or $key -eq "SUPABASE_SERVICE_ROLE_KEY") { 
                if (-not $SupabaseKey -or $key -eq "SUPABASE_SERVICE_ROLE_KEY") { $SupabaseKey = $val }
            }
        }
    }
}

if (-not $SupabaseUrl -or -not $SupabaseKey) {
    Write-Error "No se pudieron obtener VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY de $EnvPath"
    exit 1
}

# Configuración de carpetas de destino
$BaseBackupDir = "C:\inscripciones-montesion"
$FechaDia = Get-Date -Format "yyyy-MM-dd"
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$TargetFolder = Join-Path $BaseBackupDir $FechaDia

# Crear estructura de carpetas si no existen
if (-not (Test-Path $TargetFolder)) {
    New-Item -Path $TargetFolder -ItemType Directory -Force | Out-Null
}

$LogFile = Join-Path $BaseBackupDir "backup_log.txt"

Function Write-Log {
    param([string]$Message)
    $LogLine = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message"
    Write-Host $LogLine
    Add-Content -Path $LogFile -Value $LogLine -Encoding UTF8
}

Write-Log "--------------------------------------------------------"
Write-Log "Iniciando respaldo de tabla 'inscripciones'..."
Write-Log "Carpeta destino: $TargetFolder"

try {
    # Consultar Supabase REST API con Invoke-RestMethod
    $Headers = @{
        "apikey"        = $SupabaseKey
        "Authorization" = "Bearer $SupabaseKey"
        "Accept"        = "application/json"
    }
    
    $ApiUrl = "$SupabaseUrl/rest/v1/inscripciones?select=*"
    
    $Data = Invoke-RestMethod -Uri $ApiUrl -Headers $Headers -Method Get -ContentType "application/json; charset=utf-8"

    $TotalRegistros = 0
    if ($null -ne $Data) {
        $TotalRegistros = $Data.Count
    }
    Write-Log "Registros obtenidos: $TotalRegistros"

    # 1. Guardar como CSV (Excel)
    $CsvFile = Join-Path $TargetFolder "backup_inscripciones_$Timestamp.csv"
    $Data | Export-Csv -Path $CsvFile -NoTypeInformation -Encoding UTF8
    Write-Log "[OK] Archivo CSV generado: $CsvFile"

    # 2. Guardar como SQL INSERTs (Restauración)
    $SqlFile = Join-Path $TargetFolder "backup_inscripciones_$Timestamp.sql"
    $SqlLines = New-Object System.Collections.Generic.List[string]
    $SqlLines.Add("-- Respaldo de tabla inscripciones - Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
    $SqlLines.Add("-- Total de registros: $TotalRegistros")
    $SqlLines.Add("")

    foreach ($item in $Data) {
        $props = $item.psobject.Properties
        $cols = New-Object System.Collections.Generic.List[string]
        $vals = New-Object System.Collections.Generic.List[string]

        foreach ($p in $props) {
            $cols.Add("`"$($p.Name)`"")
            $val = $p.Value
            if ($null -eq $val -or $val -eq "") {
                $vals.Add("NULL")
            } elseif ($val -is [bool]) {
                if ($val) { $vals.Add("TRUE") } else { $vals.Add("FALSE") }
            } elseif ($val -is [int] -or $val -is [long] -or $val -is [double] -or $val -is [decimal]) {
                $vals.Add("$val")
            } else {
                $escaped = "$val".Replace("'", "''")
                $vals.Add("'$escaped'")
            }
        }

        $colStr = [string]::Join(", ", $cols)
        $valStr = [string]::Join(", ", $vals)
        $SqlLines.Add("INSERT INTO public.inscripciones ($colStr) VALUES ($valStr);")
    }

    [System.IO.File]::WriteAllLines($SqlFile, $SqlLines, [System.Text.Encoding]::UTF8)
    Write-Log "[OK] Archivo SQL generado: $SqlFile"
    Write-Log "Respaldo completado exitosamente en: $TargetFolder"
    Write-Log "--------------------------------------------------------"

} catch {
    Write-Log "[ERROR] Falló el respaldo: $_"
    exit 1
}
