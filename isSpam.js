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

		log() {},

		async req(url, follow = 0) {
			// manually redirect
			const request = new Request(url, {
				redirect: "manual",
			});

			return fetch(request)
				.then((res) => {
					console.log("fetch with" + follow);
					const nextUrl = res.headers.get("Location");

					// nextUrl isSpam
					this.isSpam(nextUrl);

					return (res.status === 302 || res.status === 301) &&
						follow < this.redirectionDepth
						? this.req(nextUrl, follow + 1)
						: res.text();
				})
				.then((text) => {
					this.data = text;
					return this.data;
				});
		},

		isSpam(url) {
			const domain = new URL(url).domain;

			if (this.spamLinkDomains.includes(domain)) this.result = true;
		},

		async reqAll() {
			console.log(this.urls);
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
	const isSpamInstance = new isSpamClass(
		content,
		spamLinkDomains,
		redirectionDepth
	);

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
`,
	["www.naver.com"],
	1
);

// http://test.com https://testsetset.setestset.setsetst.com
