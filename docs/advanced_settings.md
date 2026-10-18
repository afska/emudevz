# Advanced settings

In the settings menu, there's an **Advanced settings** section where you can customize the game by tweaking a JSON file.

## Format

| Property | Type | Description |
|---|---|---|
| `general.runAutoloadFile` | `boolean` | Evaluates the file located in `/usr/autoload.js` or `/.free/usr/autoload.js` to load external plugins when the level starts. |
| `general.preventReload` | `boolean` | Prevents full-page reloads and forces the game to behave like a single-page application. It can cause performance issues after long sessions due to how the player's code is evaluated. |
| `layout.triple.resizable` | `boolean` | Allows resizing the "triple" layout used by the PPU and APU levels. |
| `chat.instant` | `boolean` | Disables all typewriter effects when using the `chat` command. This has the downside of also disabling word-wrap. |
| `audio.playAudioTests` | `boolean` | Reproduces the audio tests while testing. It can cause performance issues if the CPU is not fast enough. |
| `codeEditor` | `object` | *CodeMirror* customizations. |
