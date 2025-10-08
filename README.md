# EmuDevz

🕹️ A game about coding emulators! [Check it out!](https://afska.github.io/emudevz)

[![EmuDevz: Reveal Trailer](img/thumbnail.png)](https://www.youtube.com/watch?v=sBhFulSp4KQ)

> <img alt="rlabs" width="16" height="16" src="https://user-images.githubusercontent.com/1631752/116227197-400d2380-a72a-11eb-9e7b-389aae76f13e.png" /> Created by [[r]labs](https://r-labs.io).

## Key features

## Development

### Install and run

```bash
# install nvm & node
npm install
npm start
```

### Scripts

- Build:
  `npm run build`
- Deploy to GitHub Pages:
  `npm run deploy <GH_USERNAME> <GH_TOKEN>`
  
### Generate licenses

```
cp pre-licenses.txt public/licenses.txt
yarn licenses generate-disclaimer --prod >> public/licenses.txt
```
