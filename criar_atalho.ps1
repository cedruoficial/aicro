$ws = New-Object -ComObject WScript.Shell
$desktop = [Environment]::GetFolderPath("Desktop")
$shortcut = $ws.CreateShortcut("$desktop\CTIA Sistema.lnk")
$shortcut.TargetPath = "c:\Users\laboratorio.calcado\organizador\start_ctia.vbs"
$shortcut.WorkingDirectory = "c:\Users\laboratorio.calcado\organizador"
$shortcut.Description = "Iniciar Sistema CTIA"
$shortcut.Save()
Write-Host "Atalho criado na area de trabalho!"
