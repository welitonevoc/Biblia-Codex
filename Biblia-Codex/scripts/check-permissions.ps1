# Check Permissions - Script de Verificação
# Verifica permissões do app no dispositivo Android

param(
    [string]$Device,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

Write-Host "`n🔍 Verificação de Permissões - bíblia Codex" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Verificar se ADB está disponível
$adbCheck = adb version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ADB não encontrado. Instale o Android SDK Platform Tools." -ForegroundColor Red
    Write-Host "   https://developer.android.com/studio/releases/platform-tools" -ForegroundColor Yellow
    exit 1
}

# Verificar dispositivos conectados
Write-Host "📱 Verificando dispositivos..." -ForegroundColor Yellow
$devices = adb devices
if ($devices.Count -le 2) {
    Write-Host "⚠️ Nenhum dispositivo Android conectado." -ForegroundColor Yellow
    Write-Host "   Conecte o dispositivo via USB e habilite a Depuração USB." -ForegroundColor Yellow
    Write-Host "   Para habilitar: Configurações → Sobre o Telefone → Número da Versão (toque 7x)" -ForegroundColor Gray
    Write-Host "   Depois: Configurações → Sistema → Opções de Desenvolvedor → Depuração USB" -ForegroundColor Gray
    exit 1
}

$deviceId = ($devices -match "^([a-zA-Z0-9]+)" | Select-Object -First 1).Substring(0, 8)
Write-Host "✅ Dispositivo: $deviceId" -ForegroundColor Green

# Verificar versão do Android
Write-Host "`n📲 Versão do Android:" -ForegroundColor Yellow
$androidVersion = adb shell getprop ro.build.version.release
Write-Host "   Android: $androidVersion" -ForegroundColor White

$apiLevel = adb shell getprop ro.build.version.sdk
Write-Host "   API Level: $apiLevel" -ForegroundColor White

# Verificar se o app está instalado
Write-Host "`n📦 Verificando app..." -ForegroundColor Yellow
$appStatus = adb shell pm list packages com.codex.biblia
if ($LASTEXITCODE -eq 0 -and $appStatus) {
    Write-Host "   ✅ bíblia Codex está instalado" -ForegroundColor Green
    
    # Ver permissões concedidas
    Write-Host "`n🔐 Permissões concedidas:" -ForegroundColor Yellow
    $permissions = @(
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.READ_MEDIA_IMAGES",
        "android.permission.READ_MEDIA_VIDEO",
        "android.permission.READ_MEDIA_AUDIO"
    )
    
    foreach ($perm in $permissions) {
        $result = adb shell pm dump com.codex.biblia | Select-String -Pattern $perm -Quiet
        if ($result) {
            Write-Host "   ✅ $perm" -ForegroundColor Green
        } else {
            Write-Host "   ⚪ $perm" -ForegroundColor Gray
        }
    }
    
    # Ver diretório do app
    Write-Host "`n📁 Diretório do app:" -ForegroundColor Yellow
    $dataDir = adb shell pm dump com.codex.biblia | Select-String -Pattern "dataDir=" -Quiet
    if ($dataDir) {
        Write-Host "   $dataDir" -ForegroundColor White
    }
    
} else {
    Write-Host "   ❌ bíbia Codex NÃO está instalado" -ForegroundColor Red
    Write-Host "   Instale o APK primeiro com:" -ForegroundColor Yellow
    Write-Host "   adb install android/app/build/outputs/apk/release/app-release-unsigned.apk" -ForegroundColor White
}

# Verificar armazenamento
Write-Host "`n💾 Armazenamento:" -ForegroundColor Yellow
$storage = adb shell sm list-volumes
if ($storage) {
    Write-Host "   Volumes disponíveis:" -ForegroundColor White
    $storage | ForEach-Object { Write-Host "     $_" -ForegroundColor Gray }
}

# Resultado final
Write-Host "`n========================================`n" -ForegroundColor Cyan

if ($appStatus) {
    Write-Host "✅ App instalado e permissões configuradas" -ForegroundColor Green
    Write-Host "`nPróximo passo: Teste a importação de módulos!" -ForegroundColor Cyan
    Write-Host "   1. Abra o app" -ForegroundColor White
    Write-Host "   2. vá para Configurações → Módulos" -ForegroundColor White
    Write-Host "   3. Importe um módulo MySword/MyBible" -ForegroundColor White
} else {
    Write-Host "⚠️ App precisa ser instalado" -ForegroundColor Yellow
    Write-Host "   Execute: .\scripts\build-android-apk.ps1" -ForegroundColor White
}

Write-Host "`n========================================`n" -ForegroundColor Cyan