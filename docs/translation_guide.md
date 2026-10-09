# Translation guide

If you want to add support for other languages, you should change these files (example: Japanese - `ja`):

- Create a locale file in `src/locales/ja.js`.
- Change `src/locales/index.js` so it includes the new `ja` key and the correct `TimeAgo` instance.
- Add a `language_ja` key in all `src/locales/{languageId}.js` files to localize the name that appears in the Settings modal.
- Update `src/data/dictionary.jsx` to include translations for `ja`.
- Add a `ja.yml` to each level for the chat script.
  - See `docs/chat_syntax.md` for some other considerations about the chat format.
  - Ensure the JS scripts are the same (besides small details like linking to `.ja.md` files instead of `.en.md`) and the final translated file ends up with the same number of lines as the English version.
  - Also, ensure the JS code snippets shown to the user are the same.
  - The final credits shouldn't be localized.
- Add localized documentation files (look for `*.en.md` files and create equivalent `*.ja.md` files) and update the `copy.js` scripts to copy them.
- Change the `meta.json` file in each level to localize the `name` and the console `subtitle` keys.
  - In the `FAQ` level, also update the `links` key.
- Localize all unit tests in `src/data/levels/$tests` and the `test.js` files. **This is optional**.
- Localize all theme titles and descriptions in `src/models/themes/theme.js`.
- Create a file in `src/data/levels/02_Assembly/$help/ja.txt` with help for the Assembly chapter.
  - Each line should correspond to the same line in the other languages.

## Notes

- When adding the `ja:` key in an object, please do it alphabetically. For example:
```json
	"name": {
		"en": "🏁 Flags",
		"es": "🏁 Banderas",
		"ja": "🏁 フラッグ",
		"ru": "🏁 Флаги"
	}
```

- Some languages might require some rework in the game. RTL languages might be too difficult to support.

- The _ImGui_ parts of the game (Debugger, AudioTester) don't support localization.

## Style

The tone should be casual/informal. Definitely not like a boss, since there's no hierarchy or sense of authority. Like a friend I guess, or more like an online friend since these people don't know each other in real life. They are like two people in an IRC channel talking about a common interest. One is doing the investigation / reverse engineering and the other one (the player) doing the coding part.

Something I tried when writing the Spanish localization was to avoid using gendered words at all. In English, 'are you ready?' is fine, but in Spanish I'd have to write '¿estás listo?' (masculine) or '¿estás lista?' (feminine), so in those cases I rephrased the whole thing to something like "¿comenzamos?" (shall we begin?). Similarly, the NPC avoids revealing their gender during the whole game.

Communication is friendly. There are some jokes in the game but they are clearly marked as jokes due to the emoji overuse, which is kind of part of the style xD.

The fastest way to test your translation would be to import a finished savefile to localhost and set the advanced setting `"instant": true` to remove any typewriter effects.
