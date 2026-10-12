$desktop = [Environment]::GetFolderPath('Desktop')
$wsh = New-Object -ComObject WScript.Shell

# 1. Atalho para Teste Local (.lnk)
$localShortcutPath = Join-Path $desktop "Base de Conhecimento (Teste Local).lnk"
$localShortcut = $wsh.CreateShortcut($localShortcutPath)
$localShortcut.TargetPath = "c:\Users\fulvi\Desktop\PROJETOS\BASE-DE-CONHECIMENTO\scripts\iniciar_teste_local.bat"
$localShortcut.WorkingDirectory = "c:\Users\fulvi\Desktop\PROJETOS\BASE-DE-CONHECIMENTO"
$localShortcut.Description = "Inicia o servidor de teste local (Vite) e abre no navegador"
$localShortcut.IconLocation = "$env:SystemRoot\System32\shell32.dll,220"
$localShortcut.Save()
Write-Host "Atalho local criado em: $localShortcutPath"

# 2. Atalho para Producao Firebase (.url)
$prodShortcutPath = Join-Path $desktop "Base de Conhecimento (Producao).url"
$urlContent = @"
[InternetShortcut]
URL=https://base-de-conhecimento-cc.web.app
"@
[System.IO.File]::WriteAllText($prodShortcutPath, $urlContent, [System.Text.Encoding]::ASCII)
Write-Host "Atalho de producao criado em: $prodShortcutPath"
