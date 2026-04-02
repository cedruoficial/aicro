Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "c:\Users\laboratorio.calcado\organizador"
WshShell.Run "cmd /c node server.js", 0, False
WScript.Sleep 2000
WshShell.Run "http://localhost:3000", 1, False
