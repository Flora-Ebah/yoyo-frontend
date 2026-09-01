@echo off
setlocal

set "REMOTE=origin"
set "EXIT_CODE=0"

if "%~1"=="" (
  echo [ERREUR] Message de commit manquant.
  echo Usage: push "Mon message" [branche_cible]
  exit /b 1
)

set "COMMIT_MSG=%~1"
set "TARGET_BRANCH=%~2"

where git >nul 2>&1
if errorlevel 1 (
  echo [ERREUR] Git est absent du PATH.
  exit /b 1
)

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo [ERREUR] Ce dossier n est pas un repository Git.
  exit /b 1
)

for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set "CURRENT_BRANCH=%%b"
if "%CURRENT_BRANCH%"=="" (
  echo [ERREUR] Impossible de detecter la branche courante.
  exit /b 1
)

if /i "%CURRENT_BRANCH%"=="HEAD" (
  echo [ERREUR] Vous etes en detached HEAD. Checkout une branche avant de continuer.
  exit /b 1
)

for /f "delims=" %%s in ('git status --porcelain') do set "HAS_CHANGES=1"
if not defined HAS_CHANGES (
  echo [INFO] Aucun changement a committer.
  echo [INFO] Branche courante: %CURRENT_BRANCH%
  goto :END
)

echo [INFO] Branche courante: %CURRENT_BRANCH%
echo [INFO] Incrementation de la version...

for /f "delims=" %%v in ('node -p "require('./package.json').version"') do set "OLD_VERSION=%%v"
call npm version patch --no-git-tag-version >nul 2>&1
if errorlevel 1 (
  echo [ERREUR] Echec de l incrementation de version.
  set "EXIT_CODE=1"
  goto :END
)
for /f "delims=" %%v in ('node -p "require('./package.json').version"') do set "NEW_VERSION=%%v"

if not "%OLD_VERSION%"=="%NEW_VERSION%" (
  echo [INFO] Version bumpee: %OLD_VERSION% -^> %NEW_VERSION%
)

echo [INFO] Ajout des fichiers...
git add .
if errorlevel 1 (
  echo [ERREUR] Echec de git add.
  set "EXIT_CODE=1"
  goto :END
)

echo [INFO] Commit en cours...
git commit -m "%COMMIT_MSG%"
if errorlevel 1 (
  echo [ERREUR] Echec du commit.
  set "EXIT_CODE=1"
  goto :END
)

echo [INFO] Push vers %REMOTE%/%CURRENT_BRANCH%...
git push %REMOTE% %CURRENT_BRANCH%
if errorlevel 1 (
  echo [ERREUR] Echec du push sur %CURRENT_BRANCH%.
  set "EXIT_CODE=1"
  goto :END
)

if "%TARGET_BRANCH%"=="" (
  echo [SUCCES] Commit et push termines sur %CURRENT_BRANCH%.
  goto :END
)

if /i "%TARGET_BRANCH%"=="%CURRENT_BRANCH%" (
  echo [INFO] Branche cible identique a la branche courante, rien a faire.
  goto :END
)

echo.
echo [INFO] Push supplementaire demande vers: %TARGET_BRANCH%

call :CHECK_FAST_FORWARD "%TARGET_BRANCH%"
if errorlevel 1 (
  set "EXIT_CODE=1"
  goto :END
)

echo [INFO] Push vers %REMOTE%/%TARGET_BRANCH%...
git push %REMOTE% "%CURRENT_BRANCH%:%TARGET_BRANCH%"
if errorlevel 1 (
  echo [ERREUR] Echec du push sur %TARGET_BRANCH%.
  set "EXIT_CODE=1"
  goto :END
)

echo [SUCCES] Push sur %CURRENT_BRANCH% puis %TARGET_BRANCH% termine.

:END
for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set "FINAL_BRANCH=%%b"
if not "%FINAL_BRANCH%"=="%CURRENT_BRANCH%" (
  echo [INFO] Retour sur la branche d origine: %CURRENT_BRANCH%...
  git switch "%CURRENT_BRANCH%" >nul 2>&1
  if errorlevel 1 git checkout "%CURRENT_BRANCH%" >nul 2>&1
  for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set "FINAL_BRANCH=%%b"
)

if not "%FINAL_BRANCH%"=="%CURRENT_BRANCH%" (
  echo [AVERTISSEMENT] Impossible de revenir sur %CURRENT_BRANCH%.
  set "EXIT_CODE=1"
) else (
  echo [INFO] Branche finale: %FINAL_BRANCH%
)

if "%EXIT_CODE%"=="0" (
  echo.
  echo [SUCCES] Operation terminee.
)

exit /b %EXIT_CODE%

:CHECK_FAST_FORWARD
set "TARGET=%~1"
set "TARGET_EXISTS=0"

git fetch %REMOTE% %TARGET% >nul 2>&1

git show-ref --verify --quiet "refs/remotes/%REMOTE%/%TARGET%"
if not errorlevel 1 (
  set "TARGET_EXISTS=1"
  git merge-base --is-ancestor "%REMOTE%/%TARGET%" "%CURRENT_BRANCH%" >nul 2>&1
  if errorlevel 1 (
    echo [ERREUR] Pas de fast-forward possible vers %TARGET% depuis %CURRENT_BRANCH%.
    exit /b 1
  )
  exit /b 0
)

git show-ref --verify --quiet "refs/heads/%TARGET%"
if not errorlevel 1 (
  set "TARGET_EXISTS=1"
  git merge-base --is-ancestor "%TARGET%" "%CURRENT_BRANCH%" >nul 2>&1
  if errorlevel 1 (
    echo [ERREUR] Pas de fast-forward possible vers %TARGET% depuis %CURRENT_BRANCH%.
    exit /b 1
  )
  exit /b 0
)

echo [INFO] Branche cible %TARGET% inexistante: elle sera creee sur le remote.
exit /b 0
