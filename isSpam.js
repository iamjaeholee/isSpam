import fetch, { Request } from "node-fetch";

const isSpamClass = (function () {
	function isSpamClass(
		content = "",
		spamLinkDomains = [],
		redirectionDepth = 0
	) {
		this.content = content;
		this.spamLinkDomains = spamLinkDomains;
		this.redirectionDepth = redirectionDepth;
		this.urlRegex = new RegExp("http(s?)\\:\\/\\/\\S+", "g");
		this.result = false;
	}

	isSpamClass.prototype = {
		constructor: isSpamClass,

		async req(url, follow = 0) {
			// spam check
			this.isSpam(url);

			// manually redirect option
			const request = new Request(url, {
				redirect: "manual",
			});

			return fetch(request)
				.then((res) => {
					const nextUrl = res.headers.get("Location");

					// redirect if condition meet else return text
					return (res.status === 302 || res.status === 301) &&
						follow < this.redirectionDepth
						? this.req(nextUrl, follow + 1)
						: res.text();
				})
				.then((text) => {
					this.data = text;
					// extract anchor href url and spam check
					this.extractAnchorHrefWithSpam(this.data);

					return this.data;
				});
		},

		// spam check method
		isSpam(url) {
			try {
				const domain = new URL(url).host;

				if (this.spamLinkDomains.includes(domain)) this.result = true;
			} catch {}
		},

		extractAnchorHrefWithSpam(html) {
			const anchorRegex = /<a[^>]+href=\"(.*?)\"[^>]*>/g;

			for (const match of html.matchAll(anchorRegex)) {
				this.isSpam(match[1]);
			}
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

			return this.result;
		},
	};

	return isSpamClass;
})();

const isSpam = async function isSpam(
	content,
	spamLinkDomains,
	redirectionDepth
) {
	const isSpamInstance = new isSpamClass(
		content,
		spamLinkDomains,
		redirectionDepth
	);

	isSpamInstance.check().then(console.log);
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
`,
	["docs.github.com", "www.naver.com"],
	3
);
