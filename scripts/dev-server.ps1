# CareerPilot Development Server Management Script

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "restart", "status")]
    [string]$Action
)

$PORT = 5000

function Get-PortProcess {
    $process = netstat -ano | findstr ":$PORT" | ForEach-Object {
        $parts = $_ -split '\s+' | Where-Object { $_ -ne '' }
        if ($parts.Length -ge 5 -and $parts[1] -like "*:$PORT") {
            return $parts[4]
        }
    } | Select-Object -First 1
    return $process
}

function Stop-DevServer {
    Write-Host "Checking for processes on port $PORT..." -ForegroundColor Yellow
    
    $processId = Get-PortProcess
    if ($processId) {
        Write-Host "Stopping process with PID: $processId" -ForegroundColor Red
        try {
            taskkill /PID $processId /F | Out-Null
            Write-Host "Successfully stopped development server" -ForegroundColor Green
        }
        catch {
            Write-Host "Failed to stop process: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "No process found running on port $PORT" -ForegroundColor Blue
    }
}

function Start-DevServer {
    Write-Host "Starting development server..." -ForegroundColor Green
    npm run dev
}

function Show-Status {
    Write-Host "Development Server Status" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Cyan
    
    $processId = Get-PortProcess
    if ($processId) {
        $processInfo = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($processInfo) {
            Write-Host "Server is RUNNING" -ForegroundColor Green
            Write-Host "   PID: $processId" -ForegroundColor White
            Write-Host "   Process: $($processInfo.ProcessName)" -ForegroundColor White
            Write-Host "   URL: http://localhost:$PORT" -ForegroundColor White
        } else {
            Write-Host "Port is occupied but process info unavailable" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Server is NOT running" -ForegroundColor Red
    }
}

# Main script logic
switch ($Action) {
    "start" {
        $processId = Get-PortProcess
        if ($processId) {
            Write-Host "Server is already running on port $PORT (PID: $processId)" -ForegroundColor Yellow
            Write-Host "Use 'restart' to restart or 'stop' to stop it first." -ForegroundColor Yellow
        } else {
            Start-DevServer
        }
    }
    "stop" {
        Stop-DevServer
    }
    "restart" {
        Stop-DevServer
        Start-Sleep -Seconds 2
        Start-DevServer
    }
    "status" {
        Show-Status
    }
}