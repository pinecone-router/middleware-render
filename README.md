# Display Server-Rendered Pages with Pinecone Router

[![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/pinecone-router/middleware-render?color=%2337C8AB&label=version&sort=semver)](https://github.com/pinecone-router/middleware-render/tree/0.0.1)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/pinecone-router-middleware-render?color=37C8AB)](https://bundlephobia.com/result?p=pinecone-router-middleware-render@0.0.1)
[![Downloads from Jsdelivr Github](https://img.shields.io/jsdelivr/gh/hm/pinecone-router/middleware-render?color=%2337C8AB&logo=github&logoColor=%2337C8AB)](https://www.jsdelivr.com/package/gh/pinecone-router/middleware-render)
[![Downloads from Jsdelivr NPM](https://img.shields.io/jsdelivr/npm/hm/pinecone-router-middleware-render?color=%2337C8AB&&logo=npm)](https://www.jsdelivr.com/package/npm/pinecone-router-middleware-render)
[![npm](https://img.shields.io/npm/dm/pinecone-router-middleware-render?color=37C8AB&label=npm&logo=npm&logoColor=37C8AB)](https://npmjs.com/package/pinecone-router-middleware-render)
[![Changelog](https://img.shields.io/badge/change-log-%2337C8AB)](/CHANGELOG.md)

A middleware for [Pinecone Router](https://github.com/pinecone-router/router) that add Turbolinks-like functionality with extra features.

## About

A middleware that adds Turbolinks-like functionality for Pinecone Router, while still allowing you to handle routes!

## Features:

- No server co-operation needed! serve regular html files as normally done.
- Allow route checking before displaying pages! can be used for client-side authorization etc.
- Preload pages when hovering over links!

## Installation

### CDN

Include the following `<script>` tag in the `<head>` of your document, before Pinecone Router:

```html
<script src="https://cdn.jsdelivr.net/npm/pinecone-router-render@0.0.1/dist/index.umd.js"></script>
```

**ES6 Module:**

```javascript
import 'https://cdn.jsdelivr.net/npm/pinecone-router-middleware-render@0.0.1/dist/index.umd.js';
```

### NPM

```
npm install pinecone-router-middleware-render
```

```javascript
// load this middleware
import 'pinecone-router-middleware-render';
// then load pinecone router
import 'pinecone-router';
```

> **Important**: This must be added **before** loading Pinecone Router.

## Usage

Simply add `x-render` to the Pinecone Router element:

```html
<div x-data x-router x-render></div>
```

By default this will fetch the whole page and replaces the `<body>` content.
To use another element instead, set its selector: `x-render="#content"`.

### Handling routes while using x-render

While optional, you can also handle routes while all pages render normally!

```html
<div x-data="handle()" x-router x-render>
	<template x-route="/hello/:name" x-handler="hello"></template>
</div>
```

> **Note**: The routes will be handled _before_ the page is rendered.

### Notfound and specifying routes

By default, 404 pages are left to the server to handle. However, if you'd like to specify the routes allowed, you can do it like this:

```html
<div x-data="handle()" x-router x-render>
	<template x-route="/"></template>
	<template x-route="/hello/:name"></template>
	<template x-route="notfound" x-handler="notfound"></template>
</div>
```

As you see, the handler is optional on routes as the page will be rendered
regardless, but you can add it if you need it.

### Authorization

If you'd like to make checks before actually displaying a page, using authentication/authorization etc, you can make your checks in the _handler_. Then within the handler, if you need to redirect the user to another page simply `return context.redirect('/another/page')` this way it'll prevent the views from rendering and go to the other page directly.

**Example:**

The route you'd like to authorize:
In this example the user will only be allowed to edit their own profile

```html
<div x-data="router()" x-router x-render>
...
<template
	x-route="/profile/:username/edit"
	x-handler="editprofile"
></template>
...
```

The handler: (`auth` is a placeholder name, replace it with your own auth provider methods)

```js
editprofile(context) {
	if (context.props.username != auth.username) {
		return context.redirect('/unauthorized');
	}
}
```

> **Tip!** To access the current context (props etc) from within the views, use the [$router Magic Helper](#magic-helper) or `window.AlpineRouter.currentContext`.


## Supported versions

| Version | Pinecone Router Versions |
| ------- | ------------------------ |
| 0.0.1   | 0.1.2                    |

## Contributing:

Please refer to [CONTRIBUTING.md](/CONTRIBUTING.md)

## Versioning

This projects follow the [Semantic Versioning](https://semver.org/) guidelines.

## License

Copyright (c) 2021 Rafik El Hadi Houari

Licensed under the MIT license, see [LICENSE.md](LICENSE.md) for details.
