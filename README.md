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

// ...

<AwesomeQRCode
  options={{
    text: "Awesome-qr.js",
    // ...
  }}
  onStateChange={(state) => {
    switch (state) {
      case "working":
        // ...
        break;
      case "idle":
        // ...
        break;
    }
  }}
/>;
```

## Examples

The project provides a examples gallery which demonstrates basic usages of the component.

```bash
yarn build
yarn examples
```

## Props

```typescript
interface AwesomeQRCodeProps {
  options: Partial<Options>;
  onStateChange?: (state: AwesomeQRCodeState) => void;
}
```

### _options_

**Type** `Partial<Options>`

Use this field to customize the style of your QR code.

_Options_ object defined here will be passed to the core of Awesome-qr.js.

Read the section [Options: Awesome-qr.js](https://github.com/SumiMakito/Awesome-qr.js/blob/master/README.md#options) to learn more.

### _onStateChange_

**Type** `((state: AwesomeQRCodeState) => void)?`

An optional listener for receiving the state changes.

_AwesomeQRCodeState_ is a string type contains two values: `"working"` and `"idle"`.

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
