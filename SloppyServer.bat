:: MIT License
::
:: Copyright (c) 2025 github.com/forcepusher
::
:: Permission is hereby granted, free of charge, to any person obtaining a copy
:: of this software and associated documentation files (the "Software"), to deal
:: in the Software without restriction, including without limitation the rights
:: to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
:: copies of the Software, and to permit persons to whom the Software is
:: furnished to do so, subject to the following conditions:
::
:: The above copyright notice and this permission notice shall be included in all
:: copies or substantial portions of the Software.
::
:: THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
:: IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
:: FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
:: AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
:: LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
:: OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
:: SOFTWARE.

@echo off
setlocal enabledelayedexpansion
title WebGL Server
echo Starting setup...

:: Check Node.js
echo Checking Node.js...
node -v
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not installed. Get it from https://nodejs.org.
    goto :error
)

:: Check certificates (for HTTPS on 443)
echo Checking certificates...
if not exist cert.pem (
    echo Certificates not found. Generating with OpenSSL...
    openssl req -newkey rsa:2048 -nodes -keyout key.pem -x509 -days 365 -out cert.pem -subj "/CN=localhost" 2>nul
    if not exist cert.pem (
        echo.
        echo ==================== ERROR ====================
        echo Certificate generation failed
        echo OpenSSL is required but not installed or not in PATH
        echo.
        echo Please install Standalone Git
        echo   Download from: https://git-scm.com/install/windows
        echo   Make sure C:\Program Files\Git\usr\bin is in your PATH
        echo ================================================
        goto :error
    )
    echo Certificates generated successfully.
)

:: Get Wi-Fi IP only (robust detection)
echo Getting Wi-Fi IPv4 address...
set "LOCAL_IP="
set "FOUND_WIFI="

for /f "tokens=*" %%a in ('ipconfig ^| findstr /R /C:"adapter Wi-Fi" /C:"IPv4"') do (
    echo %%a | findstr /C:"adapter Wi-Fi" >nul
    if not errorlevel 1 (
        set "FOUND_WIFI=1"
    )
    echo %%a | findstr /C:"IPv4" >nul
    if not errorlevel 1 if defined FOUND_WIFI (
        for /f "tokens=2 delims=:" %%b in ("%%a") do (
            set "LOCAL_IP=%%b"
            set "LOCAL_IP=!LOCAL_IP: =!"
        )
        set "FOUND_WIFI="
    )
)

if not defined LOCAL_IP (
    echo ERROR: No connected Wi-Fi adapter with IPv4 address found.
    goto :error
)

:: Set root folder (use drag-and-drop or find first with index.html)
if not "%~1"=="" (
    set "ROOT_FOLDER=%~1"
) else (
    for /d %%i in (*) do (
        if exist "%%i\index.html" (
            set "ROOT_FOLDER=%%i"
            goto :found
        )
    )
    echo ERROR: No folder with index.html found in %CD%.
    goto :error
)
:found

:: Resolve ROOT_FOLDER to absolute path with proper escaping
pushd %ROOT_FOLDER% 2>nul || (
    echo ERROR: Invalid folder: %ROOT_FOLDER%
    goto :error
)
set "ROOT_FOLDER=%CD:\=\\%"
popd

:: Run servers on 80 (HTTP) and 443 (HTTPS)
echo Starting servers for %ROOT_FOLDER%...
echo:
echo Close window to stop the server.

node -e "const http = require('http'), https = require('https'), fs = require('fs'), path = require('path'), url = require('url'); const root = path.normalize('%ROOT_FOLDER%'); function findWorkerFiles(dir) { try { const files = fs.readdirSync(dir); for (const file of files) { const fullPath = path.join(dir, file); const stat = fs.statSync(fullPath); if (stat.isDirectory()) { if (findWorkerFiles(fullPath)) return true; } else if (file.endsWith('.worker.js')) { return true; } } } catch (e) {} return false; } const hasWorkerFiles = findWorkerFiles(root); if (hasWorkerFiles) { console.log('Found .worker.js files in hosted folder. Strict same-origin and require-corp web security headers enabled to support SharedArrayBuffer multithreading. Page embedding and all sorts of stuff might break.'); } const serve = (req, res) => { const parsedUrl = url.parse(req.url); const pathname = parsedUrl.pathname || '/'; const filePath = path.join(root, pathname === '/' ? 'index.html' : pathname); const shortPath = path.relative(root, filePath); console.log('Request from:', req.socket.remoteAddress, 'for:', shortPath); fs.readFile(filePath, (err, data) => { if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('404 Not Found'); return; } const ext = path.extname(filePath).toLowerCase(); let contentType = 'text/plain'; if (ext === '.html') contentType = 'text/html'; else if (ext === '.js' || ext === '.mjs') contentType = 'application/javascript'; else if (ext === '.wasm') contentType = 'application/wasm'; else if (ext === '.css') contentType = 'text/css'; else if (ext === '.png') contentType = 'image/png'; else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'; res.setHeader('Content-Type', contentType); res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate'); if (hasWorkerFiles) { res.setHeader('Cross-Origin-Opener-Policy', 'same-origin'); res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp'); } res.writeHead(200); res.end(data); }); }; http.createServer(serve).listen(80, '0.0.0.0', () => { console.log('HTTP server running on http://localhost'); console.log('Wi-Fi: http://%LOCAL_IP%'); }).on('error', (err) => { console.error('HTTP server error:', err.message); }); https.createServer({ cert: fs.readFileSync('cert.pem'), key: fs.readFileSync('key.pem') }, serve).listen(443, '0.0.0.0', () => { console.log('HTTPS server running on https://localhost'); console.log('Wi-Fi: https://%LOCAL_IP%'); }).on('error', (err) => { console.error('HTTPS server error:', err.message); });"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: One or both servers failed to start. Check output.
    goto :error
)

goto :end

:error
echo.
echo FAILED. Check above for details.
pause
exit /b 1

:end
echo.
echo Done or stopped. Press any key.
pause
exit /b 0