<h1 align="center">StockChecker @LouisVuitton</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <a href="https://github.com/tak-bro/stock-checker-extension/blob/develop/LICENSE">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" target="_blank" />
  </a>
</p>

> Auto stock checker chrome-extension @louisvuitton

## Install

```sh
$ npm install
```

## Usage

> **Modify USER_ID and WEBHOOK_URL on angular/src/app/services/slack.service.ts**

```typescript
...
    private readonly WEBHOOK_URL = 'YOUR_SLACK_WEB_HOOK';
    private readonly USER_ID = 'YOUR_USER_ID';
...
```

#### Run on local

```sh
$ npm run watch
```

## Build Production

```sh
$ npm run build:production
```

## Demo

[![Demo](https://user-images.githubusercontent.com/7614353/69537413-65d94a80-0fc3-11ea-8864-9ec99eae4939.gif)](https://drive.google.com/file/d/1saf0SsyALzr9zmG88CcRpFdeT2PfN6ir/view)


## Author

👤 **Hyungtak Jin**

* Github: [@tak-bro](https://github.com/tak-bro)
* LinkedIn: [@hyungtak](https://www.linkedin.com/in/hyungtak/)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/tak-bro/stock-checker-extension/issues).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2019 [tak-bro](https://github.com/tak-bro).<br />
This project is [MIT](https://github.com/tak-bro/stock-checker-extension/blob/develop/LICENSE) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
