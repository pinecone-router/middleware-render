import { renderPage } from './utils.js';

const PineconeRouterMiddleware = {
	/**
	 * @property {string} version the version of Pinecone Router this middleware is made for.
	 */
	version: '0.0.0',
	/**
	 * @property {string} name the name of the middleware.
	 */
	name: 'x-render',
	/**
	 * @property {object} settings the middleware settings.
	 */
	settings: {
		enabled: false,
		selector: 'body',
		preload: true,
		/**
		 * @type {number} milliseconds
		 * @summary time to wait after mouse over a link before preloading a page
		 */
		preloadtime: 200,
		/**
		 * @type {object}
		 * @summary The content that has been preloaded on mouseover event.
		 */
		preloaded: { path: null, content: null },
	},

	/**
	 * This will be called at router initialization.
	 * used for detecting router settings.
	 * @param {object} component the router's alpine component.
	 */
	init(component) {
		if (this.version !== window.PineconeRouter.version) {
			throw new Error(
				`Pinecone Router ${this.name}: This middleware was built for Pinecone Router v${this.version}, found v${window.PineconeRouter.version}`
			);
		}

		if (
			window.PineconeRouterMiddlewares.find((m) => m.name == 'x-views') !=
			null
		) {
			throw new Error(
				`Pinecone Router ${this.name}: Cannot use x-render along with x-views.`
			);
		}

		if (component.$el.hasAttribute('x-render')) {
			if (window.PineconeRouter.settings.hash) {
				throw new Error(
					`Pinecone Router ${this.name}: Cannot use x-render along with x-hash.`
				);
			}
			this.settings.enabled = true;
			// check if a selector was set
			let selector = component.$el.getAttribute('x-render');
			if (selector != '') {
				this.settings.selector = selector;
			}
			// this will disable notfound handling in favor of server rendered 404 page
			// this can be overwritten if needed by making a notfound route with a handler
			window.PineconeRouter.notfound = null;
			window.PineconeRouter.settings.allowNoHandler = true;
		}
	},

	/**
	 * This will be called during PineconeRouter.interceptLinks() function
	 * after the link is checked as a valid navigation link.
	 * @param {Element} el the anchor element
	 */
	onLinkIntercepted(el) {
		if (!this.settings.enabled || !this.settings.preload) {
			return;
		}
		el.addEventListener('mouseover', (e) => {
			let path = e.target.getAttribute('href');
			if (path == null) path = '/';
			if (this.settings.preloaded.path == path) {
				return;
			}

			window.setTimeout(function () {
				fetch(path)
					.then((response) => {
						return response.text();
					})
					.then((response) => {
						this.settings.preloaded.path = path;
						this.settings.preloaded.content = response;
					});
			}, this.settings.preloadtime);
		});
	},

	/**
	 * Will be called after the handlers are executed and done.
	 * during navigation inside PineconeRouter.navigate().
	 * @param {object} _route the matched route, null if not found.
	 * @param {string} path the path visited by the client
	 * @param {boolean} firstload first page load and not link navigation request
	 * @param {boolean} notfound set to true if the route wasn't found
	 * @returns {boolean} false to make the navigate function exit (make sure to send the loadend event); none to continue execution.
	 */
	onHandlersExecuted(_route, path, firstload, notfound) {
		// if using page rendering and the user just (re)loaded the page
		// dont fetch the content as it is already loaded
		if (this.settings.enabled && !firstload && !notfound) {
			if (this.settings.preloaded.path == path) {
				renderPage(
					this.settings.preloaded.content,
					this.settings.selector,
					window.PineconeRouter.routes
				);
				window.PineconeRouter.interceptLinks();
				this.settings.preloaded.path = null;
				this.settings.preloaded.content = null;
				window.dispatchEvent(window.PineconeRouter.loadend);
				return false;
			} else {
				fetch(path)
					.then((response) => {
						return response.text();
					})
					.then((response) => {
						renderPage(
							response,
							this.settings.selector,
							window.PineconeRouter.routes
						);
						window.PineconeRouter.interceptLinks();
						window.dispatchEvent(window.PineconeRouter.loadend);
						return false;
					});
			}
		}
	},
};

if (window.PineconeRouterMiddlewares == null)
	window.PineconeRouterMiddlewares = [PineconeRouterMiddleware];
else window.PineconeRouterMiddlewares.push(PineconeRouterMiddleware);
