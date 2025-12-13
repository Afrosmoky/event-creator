export function download(filename: string, url: string) {
	const element = document.createElement('a');
	element.style.display = 'none';
	element.setAttribute('href', url);
	element.setAttribute('download', filename);

	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}
