; build/installer.nsh — Script de instalación NSIS personalizado para Prevensso Pro

!macro customHeader
  !system "echo Instalando Prevensso Pro..."
!macroend

!macro customInit
  ; Verificar si ya está instalado
  ReadRegStr $R0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\{prevensso-pro}" "DisplayVersion"
  ${If} $R0 != ""
    MessageBox MB_YESNO|MB_ICONQUESTION "Ya existe una versión anterior de Prevensso Pro ($R0). ¿Deseas actualizarla?" IDYES upgrade IDNO cancel
    upgrade:
      Goto done
    cancel:
      Abort
    done:
  ${EndIf}
!macroend

!macro customInstall
  ; Crear acceso directo en escritorio con ícono personalizado
  CreateShortcut "$DESKTOP\Prevensso Pro.lnk" "$INSTDIR\Prevensso Pro.exe" "" "$INSTDIR\Prevensso Pro.exe" 0
!macroend

!macro customUninstall
  ; Limpiar acceso directo del escritorio
  Delete "$DESKTOP\Prevensso Pro.lnk"
!macroend
