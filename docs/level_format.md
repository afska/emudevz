# Level format

## ⚙️ meta.json

The `meta.json` file defines how a level is displayed and tested.

| Property | Type | Required | Description |
|---|---|---|---|
| `name` | `object` | Yes | Localized title map with language codes as keys (`en`, `es`). |
| `ui` | `object` | Yes | UI layout and panels/components configuration. |
| `test` | `object` | No | Unit test configuration for the level. Present in code-driven levels. |
| `memory` | `object` | No | Level memory preload and behavior configuration. |
| `videoTests` | `array` | No | List of video-based regression tests (PPU frames) for this level. |
| `audioTests` | `array` | No | List of audio-based regression tests (APU samples) for this level. |
| `unlocksGame` | `string` | No | Slug of a "let's play" level unlocked after completing the level. |
| `help` | `object` | No | Extra help lines that will be added in this level (e.g. `{ "addLines": [1, 4] }`). |

### `name` object

| Property | Type | Description |
|---|---|---|
| `en` | `string` | English title. |
| `es` | `string` | Spanish title. |

### `ui` object

| Property | Type | Required | Description |
|---|---|---|---|
| `run` | `string` | No | Code file to run when the level starts (must exist in the `code/` folder).
| `layout` | `string` | Yes | Layout preset. One of: `mono`, `dual`, `triple`, `tripleRight`, `tripleBottom`, `quad`. |
| `components` | `object` | Yes | Regions to mount UI components. Keys depend on layout. |
| `focus` | `string` | No | Initial focused region. For example: `Left`, `Right`, `Top`, `Bottom`, `Main`. |
| `canPinEmulator` | `boolean` | No | Whether emulator can be pinned in UI. |
| `debuggerPinType` | `string` | No | Pin suffix used when launching debugger. |
| `specialSong` | `string` | No | Background song name for the level. When used, only this song will be played during the level. |

Regions under `components` depend on the `layout`:
- For `mono`: `Main`
- For `dual`: `Left`, `Right`
- For `triple` and `tripleBottom`: `Left`, `Top`, `Bottom`
- For `tripleRight`: `Right`, `Top`, `Bottom`

Each region is an array: `["componentType", optionsObject]`.

Example:

```json
{
  "Left": [
    "console",
    {
      "startup": "chat",
      "availableCommands": ["chat", "test", "help", "clear"]
    }
  ],
  "Bottom": [
    "cpu",
    {
      "delay": 500,
      "hideFlags": true,
      "hideStack": true
    }
  ],
  "Top": [
    "code",
    {
      "language": "asm",
      "action": "step"
    }
  ]
}
```

Component types and options:

- `console`
  - `startup`: startup command (`string`) (e.g. `"chat"`, `"chat -f"`)
  - `availableCommands`: list of available commands (`string[]`)
  - `subtitle`: subtitle, printed as a header (`{ en: string, es: string }`)
  - `links`: list of hyperlinks used by the terminal (`{ text: string, href: string }[]`)

- `code`
  - `language`: programming language (`string`) (one of: `"javascript"`, `"asm"`, `"plaintext"`)
  - `initialCodeFile`: initial code preload (`string`) (must exist in the `code/` folder)
  - `action`: main button action (`string`) (one of: `"run"`, `"step"`, `"none"`)
  - `onlyShowActionWhen`: action show condition (`code`) (e.g. `"m.$canRun"`)
  - `onlyEnableActionWhen`: action enable condition (`code`) (e.g. `"m.$canRun"`)
  - `onlyEnableEditionWhen`: edition enable condition (`code`) (e.g. `"m.$canEdit"`)
  - `readOnly`: whether the code should be read only (`boolean`)

- `multifile`
  - all `code` options
  - `extraLangOptions`: extra options passed to _eslint_ (`object`)

- `tv`
  - `type`: TV content type (`string`) (one of: `"media"`, `"markdown"`, `"rom"`, `"demoRom"`, `"stream"`, `"audioTest"`, `"videoTest"`)
  - `withFileSearch`: whether the TV should have a file search (`boolean`)

- `cpu`
  - `delay`: number of ms (`number`)
  - `hideFlags`: whether the flags table should be hidden (`boolean`)
  - `hideStack`: whether the stack table should be hidden (`boolean`)

- `debugger`
  - `readOnly`: whether the debugger is read only (`boolean`)
  - `initialTab`: initial focused tab (`string`) (e.g. `"APU"`)

- `neeestester`
  - no options

### `test` object

| Property | Type | Required | Description |
|---|---|---|---|
| `context` | `string` | Yes | Test context. One of: `"javascript"`, `"asm"`. |
| `inherit` | `string[]` | No | List of test files to include. `"*"` means all. |
| `mainTestFile` | `string` | No | Main test file to highlight/run. |
| `fsMode` | `boolean` | No | Enables filesystem mode for tests (looks for `*.test.js`). |

### `memory` object

| Property | Type | Required | Description |
|---|---|---|---|
| `content` | `object` | No | Content flags for memory/files. |

`memory.content` fields:
- `multifile`: enable support for multiple files (`boolean`)
- `protected`: whether the file system is read only (`boolean`)
- `useTemp`: enable temporary content storage (`boolean`)

### `videoTests` item

| Property | Type | Required | Description |
|---|---|---|---|
| `rom` | `string` | Yes | Path to ROM to run. |
| `frames` | `number` | Yes | Number of frames to compare. |
| `ppu` | `string` | Yes | Test PPU implementation filename (must exist in the `code/` folder). |
| `saveState` | `string` | No | Optional savestate to load before the test (must exist in the `code/` folder). |

### `audioTests` item

| Property | Type | Required | Description |
|---|---|---|---|
| `rom` | `string` | Yes | Path to ROM to run. |
| `frames` | `number` | Yes | Number of frames to compare. |
| `apu` | `string` | Yes | Test APU implementation filename (must exist in the `code/` folder). |

## 📁 bin/ folder

This folder contains binary files that can be referenced via code through `level.bin["filename"]`.

## 📁 code/ folder

This folder contains code files that can be referenced via code through `level.code["filename"]`.

## 📁 media/ folder

This folder contains multimedia files that can be referenced via code through `level.media["filename"]`.
