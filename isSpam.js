import fetch, { Request } from "node-fetch";

const isSpam = (function () {
	function isSpam(content, spamLinkDomains, redirectionDepth) {
		this.content = content;
		this.spamLinkDomains = spamLinkDomains;
		this.redirectionDepth = redirectionDepth;
	}

	isSpam.prototype = {
		constructor: isSpam,

		test() {
			// const request = new Request(content, { redirect: "manual" });
			const request = new Request(this.content);

			fetch(request)
				.then((res) => {
					console.log(res.status);
					return res;
				})
				.then((res) => res.text())
				.then(console.log);
		},
	};

	return isSpam;
})();

new isSpam("https://moiming.page.link/exam?_imcp=1").test();
