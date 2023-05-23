import fetch, { Request } from "node-fetch";

const isSpamClass = (function () {
	function isSpamClass(content, spamLinkDomains, redirectionDepth) {
		this.content = content;
		this.spamLinkDomains = spamLinkDomains;
		this.redirectionDepth = redirectionDepth;
		this.hasNext = false;
		this.urlRegex = new RegExp("http(s?)\\:\\/\\/\\S+", "g");
	}

	isSpamClass.prototype = {
		constructor: isSpamClass,

		log() {
			console.log(this.hasNext);
			console.log(this.data);
			console.log(this.urls);
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

		urlsFromContent() {
			this.urls = this.content
				.match(this.urlRegex)
				.filter((v) => this.isValidUrl(v));
		},

		isValidUrl(string) {
			try {
				new URL(string);
				return true;
			} catch (err) {
				return false;
			}
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

	isSpamInstance.urlsFromContent();
	// await isSpamInstance.req();
	isSpamInstance.log();
};

isSpam(
	`
http://test.com https://testsetset.setestset.setsetst.com

adfadsfsd
fsf

sf
asd
fa

http://@@#:w
`
);
