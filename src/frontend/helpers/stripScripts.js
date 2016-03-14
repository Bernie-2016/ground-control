export default function(s) {
	const div = document.createElement('div');
	div.innerHTML = s;
	const scripts = div.getElementsByTagName('script');
	let i = scripts.length;
	while (i--) {
	  scripts[i].parentNode.removeChild(scripts[i]);
	}
	return {__html: div.innerHTML}
}