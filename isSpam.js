import fetch, { Request } from "node-fetch";

const isSpamClass = (function () {
	function isSpamClass(content, spamLinkDomains, redirectionDepth) {
		this.content = content;
		this.spamLinkDomains = spamLinkDomains;
		this.redirectionDepth = redirectionDepth;
		this.hasNext = false;
	}

	isSpamClass.prototype = {
		constructor: isSpamClass,

		log() {
			console.log(this.hasNext);
			console.log(this.data);
		},

		async req() {
			// manually redirect
			const request = new Request(this.content, { redirect: "manual" });

			return fetch(request)
				.then((res) => {
					if (res.status === 302 || res.tatus === 301) this.hasNext = true;
					return res.text();
				})
				.then((text) => {
					this.data = text;
					return this.data;
				});
		},
	};

	return isSpamClass;
})();

const isSpam = async function isSpam(
	content,
	spamLinkDomains,
	redirectionDepth
) {
	const isSpamInstance = new isSpamClass(content);

	await isSpamInstance.req();
	isSpamInstance.log();
};

isSpam("https://moiming.page.link/exam?_imcp=1");
