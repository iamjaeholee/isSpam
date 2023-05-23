import fetch from "node-fetch";

function isSpam(content, spamLinkDomains, redirectionDepth) {
	fetch(content).then(console.log);
}

isSpam("https://moiming.page.link/exam?_imcp=1");
