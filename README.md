# ngx-amplify
An angular library for integration AWS cloud services (cognito)

[![npm version](http://img.shields.io/npm/v/ngx-amplify.svg?style=flat)](https://npmjs.org/package/ngx-amplify "View this project on npm")
[![ISC license](http://img.shields.io/badge/license-ISC-brightgreen.svg)](http://opensource.org/licenses/ISC)


## Table Of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)


## Installation

```bash
npm install --save ngx-amplify amazon-cognito-identity-js amazon-cognito-identity-js-typescript
```

## Getting Started

The simplest way to use `ngx-amplify` is to use `NgxAmplifyModule.forRoot`

```typescript
import { NgxAmplifyModule } from 'ngx-amplify';

@Module({
  imports: [
    NgxAmplifyModule.forRoot({
      region:'us-east-x',
      userPoolId: 'us-east-1_kT3FBpRxA',
      appId: '1r9vg3ob81jamk62mjepejd3db',
      idpUrl: `cognito-idp.us-east-x.amazonaws.com`,
      identityPoolId: 'us-east-1:08f3112b-cc65-49e4-8063-81f16cccd1ax'
    }),
  ],
})
export class AppModule {}
```

add the following code to the polyfill.ts file 

```typescript
 * APPLICATION IMPORTS
 */
(window as any).global = window;
(window as any).process = {
  env: { DEBUG: undefined },
};
```

## Contributing

I would greatly appreciate any contributions to make this project better. Please
make sure to follow the below guidelines before getting your hands dirty.

1. Fork the repository
2. Create your branch (`git checkout -b my-branch`)
3. Commit any changes to your branch
4. Push your changes to your remote branch
5. Open a pull request

## License

Distributed under the ISC License. See `LICENSE` for more information.

## Acknowledgements

- [ntegral inc](http://www.ntegral.com)
- [aws](https://aws.amazon.com)

Copyright &copy; 2019 Ntegral Inc.

