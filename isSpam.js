import fetch, { Request } from "node-fetch";

const isSpamClass = (function () {
	function isSpamClass(content, spamLinkDomains, redirectionDepth) {
		this.content = content;
		this.spamLinkDomains = spamLinkDomains;
		this.redirectionDepth = redirectionDepth;
		this.urlRegex = new RegExp("http(s?)\\:\\/\\/\\S+", "g");
		this.result = false;
	}

	isSpamClass.prototype = {
		constructor: isSpamClass,

		log() {
			console.log(this.hasNext);
			console.log(this.data);
			console.log(this.urls);
		},

		async req(url, follow = 0) {
			// manually redirect
			const request = new Request(url, { redirect: follow });
			// hasNext:boolean, nextUrl: string, data: string
			const isSpamData = [];

			return fetch(request)
				.then((res) => {
					isSpamData.push(res.status === 302 || res.status === 301);
					console.log(res.body);
					return res.text();
				})
				.then((text) => {
					this.data = text;
					return this.data;
				});
		},

		async reqAll() {
			return Promise.all(this.urls.map((v) => this.req(v)));
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

		async check() {
			this.urlsFromContent();
			await this.reqAll();
			this.log();

			return true;
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

	isSpamInstance.check();
};

isSpam(
	`
	https://moiming.page.link/exam?_imcp=1

adfadsfsd
fsf

sf
asd
fa

http://@@#:w
`
);

// http://test.com https://testsetset.setestset.setsetst.com
