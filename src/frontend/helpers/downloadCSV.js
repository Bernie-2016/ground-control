export default function(csv, fileName) {
	let byteNumbers = new Uint8Array(csv.length);

	for (let i = 0; i < csv.length; i++){
	  byteNumbers[i] = csv.charCodeAt(i);
	}
	let blob = new Blob([byteNumbers], {type: "text/csv"});

	    // Construct the uri
	let uri = URL.createObjectURL(blob);

	// Construct the <a> element
	let link = document.createElement("a");
	link.download = fileName;
	link.href = uri;

	document.body.appendChild(link);
	link.click();

	// Cleanup the DOM
	document.body.removeChild(link);
}