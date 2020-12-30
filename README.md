# react-awesome-qr

A React Component for Awesome-qr.js

![](https://img.shields.io/npm/v/@awesomeqr/react) ![](https://img.shields.io/npm/v/@awesomeqr/react/beta)

## Getting started

```bash
yarn add @awesomeqr/react
# OR using npm
npm install --save @awesomeqr/react
```

```tsx
import { AwesomeQRCode } from "@awesomeqr/react";

const options = {
    text: "Hello AwesomeQR",
    ...
}

...

<AwesomeQRCode {...options} />
```

## Configuration

The _AwesomeQRCode_ components accepts properties as defined in [Options in Awesome-qr.js](https://github.com/SumiMakito/Awesome-qr.js/tree/beta/2.0.0#options).

## Copyright &amp; License

Awesome-qr.js is licensed under Apache License 2.0 License.

```
Copyright (c) 2020 Makito

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
