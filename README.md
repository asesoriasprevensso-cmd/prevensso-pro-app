# Prevensso Pro v2.0 — Guía de Instalación Electron

## 🖥️ Convertir a App de Escritorio

Esta guía te permite convertir **Prevensso Pro** en una aplicación de escritorio
instalable (.exe para Windows, .dmg para Mac, .AppImage para Linux).

---

## 📋 Requisitos Previos

1. **Node.js** versión 18 o superior
   - Descargar desde: https://nodejs.org
   - Verifica la instalación: `node --version`

2. **Git** (opcional)
   - Descargar desde: https://git-scm.com

---

## 📁 Estructura de Archivos Necesaria

```
prevensso-electron/
├── main.js                    ← Motor principal Electron
├── preload.js                 ← Bridge seguro Node/Web
├── splash.html                ← Pantalla de carga animada
├── package.json               ← Configuración del proyecto
├── Prevensso_Pro_v2.html      ← ⚠️ COPIAR AQUÍ tu plataforma
├── assets/
│   ├── icon.png               ← ⚠️ Logo PNG (256x256 mínimo)
│   ├── icon.ico               ← ⚠️ Logo ICO para Windows
│   └── icon.icns              ← Para Mac (opcional)
└── build/
    └── installer.nsh          ← Script instalador Windows
```

---

## 🚀 Pasos de Instalación

### Paso 1 — Preparar archivos

1. Copia `Prevensso_Pro_v2.html` dentro de la carpeta `prevensso-electron/`
2. Copia tu logo `Logo_Prevensso_Pro.png` a `assets/icon.png`
3. Para Windows necesitas también `icon.ico` — puedes convertir el PNG en:
   https://convertio.co/png-ico/

### Paso 2 — Instalar dependencias

Abre una terminal en la carpeta `prevensso-electron/` y ejecuta:

```bash
npm install
```

Esto instalará Electron y electron-builder automáticamente.

### Paso 3 — Probar la app

```bash
npm start
```

Se abrirá Prevensso Pro como aplicación de escritorio con:
- ✅ Pantalla de carga animada con logo
- ✅ Ventana maximizada automáticamente
- ✅ Menú de aplicación nativo
- ✅ Acceso directo a imprimir (Ctrl+P)

### Paso 4 — Construir el instalador

**Para Windows (.exe instalable):**
```bash
npm run build-win
```

**Para Mac (.dmg):**
```bash
npm run build-mac
```

**Para Linux (.AppImage):**
```bash
npm run build-linux
```

El instalador se generará en la carpeta `dist/`

---

## 📦 Resultado Final

Después del build obtendrás:

```
dist/
└── Prevensso Pro Setup 2.0.0.exe    ← Instalador Windows
```

El instalador:
- ✅ Instala la app en `C:\Program Files\Prevensso Pro`
- ✅ Crea acceso directo en el escritorio
- ✅ Aparece en el menú de inicio de Windows
- ✅ Aparece en "Agregar o quitar programas"
- ✅ Tiene pantalla de splash con logo animado
- ✅ Menú de aplicación en español
- ✅ Atajos de teclado (Ctrl+P imprimir, F11 pantalla completa, F5 recargar)

---

## 🎨 Personalización

### Cambiar el ícono de la aplicación
Reemplaza los archivos en `assets/`:
- `icon.png` — PNG 256x256 píxeles mínimo (sin fondo)
- `icon.ico` — ICO multi-resolución para Windows

### Cambiar el nombre de la empresa en el instalador
Edita `package.json`:
```json
"author": {
  "name": "Tu Empresa",
  "email": "tu@email.com"
}
```

### Cambiar el nombre del instalador
Edita `package.json`:
```json
"productName": "Prevensso Pro — Tu Empresa"
```

---

## 🔧 Solución de Problemas

**Error: "electron not found"**
```bash
npm install electron --save-dev
```

**Error: "Cannot find module"**
```bash
rm -rf node_modules
npm install
```

**El logo no aparece en la splash**
- Verifica que `assets/icon.png` existe
- El PNG debe tener fondo transparente

**La app no abre la plataforma**
- Verifica que `Prevensso_Pro_v2.html` está en la raíz de la carpeta

---

## 📞 Soporte

asesorias.prevensso@gmail.com

© 2025 Prevensso Pro® — Todos los derechos reservados
