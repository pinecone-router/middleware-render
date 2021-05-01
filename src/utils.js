/**
 * This will replace the content fetched from `path` into `selector`.
 * The content is assumed to not be an entire html page but a chunk of it.
 * @param {string} content the html content.
 * @param {string} selector the selector of where to put the content.
 */
function renderContent(content, selector) {
	// replace the content of the selector with the fetched content
	document.querySelector(selector).innerHTML = content;
}

/**
 * This takes the document fetched, and check if it have any routers.
 * @param {Document} doc
 * @param {string} selector
 * @param {array} routes
 * @returns {object} {doc, routes}
 */
export function processRoutersInFetchedDoc(doc, selector, routes) {
	let routersInDoc = doc.querySelectorAll('[x-router]');
	switch (routersInDoc.length) {
		case 0:
			// if there is no router in the fetched doc, remove the routes registered
			// but only if the selector is body
			if (selector == 'body') routes = [];
			break;
		case 1:
			// the router currently loaded
			let currentRouter = document.querySelector('[x-router]');
			// if the router in the doc dont have x-router set to 'loaded'
			// thus remove it from the current router element before checking if they're the same
			currentRouter.setAttribute('x-router', '');
			// check if the one in fetched doc is the same as the current one
			if (
				routersInDoc[0].isEqualNode(
					document.querySelector('[x-router]')
				)
			) {
				// if it is, mark the router as loaded, so routes wont be processed again
				routersInDoc[0].setAttribute('x-router', 'loaded');
				// remove the router element currently in the page, in case it is not within the selector.
				document.querySelector('[x-router]').remove();
			} else {
				// if they're not the same remove the routes, the new ones will be added once this new router is added
				routes = [];
				document.querySelector('[x-router]').remove();
			}
			break;
		default:
			// more than one
			throw new Error(
				'Pinecone Router x-render: there can only be one router in the same page'
			);
	}

	return { doc, routes };
}

/**
 * This will replace the content fetched from `path` into `selector`.
 * Unlike renderContent, this will assume the fetched content to be an entire HTML.
 * meaning it needs to process the routes as well.
 * @param {string} content the html content.
 * @param {string} selector the selector of where to put the content.
 * @param {array} routes routes array to be processed.
 * @returns {array} processed routes
 */
export function renderPage(content, selector, routes) {
	let doc = new DOMParser().parseFromString(content, 'text/html');
	doc = doc.querySelector(selector);
	// This takes the document fetched, remove routers already initialized from it
	// and also remove routers initialized but not found in it
	// that is for routers that are not needed in this page.
	let r = processRoutersInFetchedDoc(doc, selector, routes);
	doc = r.doc;
	content = doc.innerHTML;
	renderContent(content, selector);
	window.PineconeRouter.routes = r.routes;
}
