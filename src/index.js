import { renderPage } from './utils.js';

const PineconeRouterMiddleware = {
	/**
	 * @property {string} version the version of this middleware.
	 */
	version: '0.0.3',
	/**
	 * @property {string} name the name of the middleware.
	 */
	name: 'render',
	/**
	 * @property {object} settings the middleware settings.
	 */
	settings: {
		enable: false,
		selector: 'body',
		preload: true,
		/**
		 * @type {number} milliseconds
		 * @summary time to wait after mouse over a link before preloading a page
		 */
		preloadTime: 200,
		/**
		 * @type {object}
		 * @summary The content that has been preloaded on mouseover event.
		 */
		preloaded: { path: '', content: null },
	},

	/**
	 * @event pinecone-start
	 * @summary be dispatched to the window after before page start loading.
	 */
	loadStart: new Event('pinecone-start'),

	/**
	 * @event pinecone-end
	 * @summary will be dispatched to the window after the views are fetched
	 */
	loadEnd: new Event('pinecone-end'),

	/**
	 * This will be called at router initialization.
	 * used for detecting router settings.
	 * @param {object} component the router's alpine component.
	 */
	init(component, settings) {
		if (settings?.middlewares?.views) {
			throw new Error(
				`Pinecone Router ${this.name}: Cannot use views middleware along with render.`
			);
		}

		//load settings
		this.settings = {
			...this.settings,
			...(settings?.middlewares?.[this.name] ?? {}),
		};

		if (this.settings.enable) {
			if (settings.hash) {
				throw new Error(
					`Pinecone Router ${this.name}: Cannot use x-render along with x-hash.`
				);
			}
			window.PineconeRouter.settings.allowNoHandler = true;
			component.$el.setAttribute('x-router', 'loaded');
			if (this.settings.preload) this.interceptLinks(settings.hash);
		}
	},

	/**
	 * This will intercept links for mouse hover
	 */
	interceptLinks(hash) {
		var t = this;
		document.body.addEventListener('onmouseover', function (e) {
			// ensure link
			// use shadow dom when available if not, fall back to composedPath()
			// for browsers that only have shady
			let el = e.target;

			let eventPath =
				e.path || (e.composedPath ? e.composedPath() : null);

			if (eventPath) {
				for (let i = 0; i < eventPath.length; i++) {
					if (!eventPath[i].nodeName) continue;
					if (eventPath[i].nodeName.toUpperCase() !== 'A') continue;
					if (!eventPath[i].href) continue;

					el = eventPath[i];
					break;
				}
			}

			// allow skipping handler
			if (el.hasAttribute('native')) return;

			// check if the link is a navigation/relative link
			var check = window.PineconeRouter.validLink(el, hash);
			if (!check.valid) return;
			if (t.settings.preloaded.path == check.link) return;

			window.setTimeout(function () {
				fetch(check.link)
					.then((response) => {
						return response.text();
					})
					.then((response) => {
						t.settings.preloaded.path = path;
						t.settings.preloaded.content = response;
					});
			}, t.settings.preloadTime);
		});
	},

	/**
	 * Will be called after the handlers are executed and done.
	 * during navigation inside PineconeRouter.navigate().
	 * @param {object} _route the matched route, null if not found.
	 * @param {string} path the path visited by the client
	 * @param {boolean} firstLoad first page load and not link navigation request
	 * @returns {boolean} false to make the navigate function exit (make sure to send the loadend event); none to continue execution.
	 */
	onHandlersExecuted(_route, path, firstLoad) {
		// if using page rendering and the user just (re)loaded the page
		// dont fetch the content as it is already loaded
		if (this.settings.enable && !firstLoad && !!route) {
			if (this.settings.preloaded.path == path) {
				renderPage(
					this.settings.preloaded.content,
					this.settings.selector,
					window.PineconeRouter.routes
				);
				this.settings.preloaded.path = null;
				this.settings.preloaded.content = null;
				window.dispatchEvent(this.loadEnd);
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
						//this.interceptLinks();
						window.dispatchEvent(this.loadEnd);
						return false;
					});
			}
		}
	},

	onBeforeHandlersExecuted(_route, _path, _firstLoad) {
		window.dispatchEvent(this.loadStart);
	},
};

if (window.PineconeRouterMiddlewares == null)
	window.PineconeRouterMiddlewares = [PineconeRouterMiddleware];
else window.PineconeRouterMiddlewares.push(PineconeRouterMiddleware);
