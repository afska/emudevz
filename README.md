# emudevz

## Install

```bash
# install nvm & node
npm install
```

## Scripts

### Web

- Run:
  `npm run web`
- Build:
  `npm run build:web`
- Deploy to GitHub Pages:
  `npm run deploy <GH_USERNAME> <GH_TOKEN>`

### Desktop

- Run:
  `npm run desktop`
- Build for Windows:
  `npm run build:windows`
- Build for Linux:
  `npm run build:linux`

### Shared:

- Run tests:
  `npm test`

### Generate licenses

```
cp pre-licenses.txt public/licenses.txt
yarn licenses generate-disclaimer --prod > public/licenses.txt
```
