# Minecraft Launcher — szkic

To prosty szkic aplikacji desktopowej (Electron), która pozwala wybrać plik wykonywalny i uruchomić go, zbierając stdout/stderr do okna logów.

- Ważne: ten projekt NIE ominie autoryzacji Minecraft/Microsoft. Użytkownik musi posiadać grę i korzystać z oficjalnych mechanizmów logowania.
- Zalecane użycie: wybrać oficjalny `minecraft-launcher` lub inny autoryzowany plik wykonywalny z systemu.

Instalacja i uruchomienie:

```bash
cd minecraft-launcher
npm install
npm run start
```

Uwaga:
- Ten projekt to szkielet — nie implementuje automatycznego pobierania wersji, zarządzania bibliotekami ani uwierzytelniania Microsoft.
- Jeśli chcesz, mogę rozbudować launcher o pobieranie wersji, uruchamianie klienta Java z poprawnym classpath i (opcjonalnie) integrację z Microsoft OAuth — wymaga to pracy i konfiguracji po stronie kont deweloperskich.

Nowe możliwości (backend):

- Instalacja wersji i pobieranie bibliotek:
	- IPC: `install-version` — wywołanie z Electron renderer lub CLI.
	- Lokalizacja instalacji: `~/.minecraft` lub ścieżka z `MC_HOME`.
- Uruchamianie z Java:
	- IPC: `launch-version` — uruchamia zbudowany classpath i `mainClass` z metadanych wersji.

Wymagania systemowe:
- Zainstalowana Java (JRE/JDK) dostępna w `PATH` lub podana ścieżka do `java`.
- Na Linuxie przed uruchomieniem Electron może wymagać bibliotek systemowych (przykład dla Ubuntu):

```bash
sudo apt-get update
sudo apt-get install -y libatk1.0-0 libgtk-3-0 libnss3 libxss1 libasound2 libx11-xcb1 libxcomposite1 libxrandr2 libgbm1
```

Prosty przykład instalacji wersji przez CLI:

```bash
# z poziomu katalogu projektu
node backend/cli-install.js 1.16.5
```

Instalacja zakresowa (np. od 1.21.4 do najnowszej):

```bash
# instaluj wszystkie wersje od 1.21.4 do najnowszej
node backend/cli-install-range.js 1.21.4 latest

# lub podaj zakres (np. 1.21.4 do 1.22.0)
node backend/cli-install-range.js 1.21.4 1.22.0
```

Uwaga prawne i bezpieczeństwo:
- Ten projekt nie dokonuje autoryzacji za użytkownika. Musisz posiadać legalne konto i tokeny, jeśli chcesz uruchamiać wersje wymagające uwierzytelnienia.

Budowanie Windows `.exe`:

- Dodałem konfigurację `electron-builder` oraz workflow GitHub Actions, które buduje instalator na `windows-latest` i przechowuje artefakty w zakładce Actions → run.
- Uruchom lokalne budowanie na Windowsie (zalecane) lub użyj workflow:

Lokalnie na Windows:
```powershell
cd minecraft-launcher
npm ci
npm run dist
```

Uwaga: budowa `.exe` na Linuxie wymaga dodatkowych narzędzi (wine/mono) i cross-kompilacji — rekomenduję użycie GitHub Actions lub budowę bezpośrednio na Windows.
