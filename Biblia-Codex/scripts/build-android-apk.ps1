# Build Android APK - Script Automatizado
# Gera APK release para teste em dispositivo físico

param(
    [switch]$Release,
    [switch]$Debug
)

$ErrorActionPreference = "Stop"

Write-Host "`n📦 bíblia Codex - Build Android APK" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# 1. Limpar build anterior
Write-Host "🧹 Limpando build anterior..." -ForegroundColor Yellow
if (Test-Path "android/app/build/outputs") {
    Remove-Item -Recurse -Force "android/app/build/outputs"
}

# 2. Build do projeto web
Write-Host "🌐 Fazendo build do projeto web..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no build web" -ForegroundColor Red
    exit 1
}

# 3. Sincronizar com Capacitor
Write-Host "📱 Sincronizando com Capacitor..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro na sincronização" -ForegroundColor Red
    exit 1
}

# 4. Build do APK
Write-Host "🔨 Compilando APK..." -ForegroundColor Yellow
Push-Location android
if ($Debug) {
    .\gradlew assembleDebug
} else {
    .\gradlew assembleRelease
}
Pop-Location

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no build Gradle" -ForegroundColor Red
    exit 1
}

# 5. Resultado
Write-Host "`n✅ Build concluído!" -ForegroundColor Green
$apkPath = "android/app/build/outputs/apk/release/app-release-unsigned.apk"
if ($Debug) {
    $apkPath = "android/app/build/outputs/apk/debug/app-debug.apk"
}

if (Test-Path $apkPath) {
    $size = (Get-Item $apkPath).Length / 1MB
    Write-Host "📦 APK: $apkPath" -ForegroundColor Cyan
    Write-Host "📏 Tamanho: $([math]::Round($size, 2)) MB" -ForegroundColor Cyan
    Write-Host "`nPara instalar no dispositivo:" -ForegroundColor Yellow
    Write-Host "  adb install $apkPath" -ForegroundColor White
} else {
    Write-Host "⚠️ APK não encontrado em caminho padrão" -ForegroundColor Yellow
    Get-ChildItem "android/app/build/outputs/apk" -Recurse -Filter "*.apk" | ForEach-Object {
        Write-Host "  📦 $($_.FullName)" -ForegroundColor Cyan
    }
}

Write-Host "`n================================`n" -ForegroundColor Cyan