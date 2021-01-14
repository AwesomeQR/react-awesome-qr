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
import { AwesomeQRCode, AwesomeQRCodeProps, AwesomeQRCodeState } from "@awesomeqr/react"

const props: AwesomeQRCodeProps = {
    text: "Hello AwesomeQR",
    ...
    onStateChange: (state: AwesomeQRCodeState) => {
        switch (state) {
            case 'working':
                // ...
                break
            case 'idle':
                // ...
                break
        }
    }
}

...

<AwesomeQRCode {...props} />
```

## Configuration

_AwesomeQRCodeProps_ contains the properties from _Options_ as defined in [Options: Awesome-qr.js](https://github.com/SumiMakito/Awesome-qr.js/blob/master/README.md#options) and a few exclusive properties owned by this component.

### onStateChange

```ts
((state: AwesomeQRCodeState) => void)?
                         ↖ 'working' | 'idle'
```

Setting up a state changes listener to know when the core is working or idle.

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
