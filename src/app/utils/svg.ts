export function createSvgBlobFromSvg(svg: SVGElement) {
  const serializer = new XMLSerializer();

  let source = serializer.serializeToString(svg);
  if (!source.startsWith("<?xml")) {
    source = `<?xml version="1.0" encoding="UTF-8"?>\n${source}`;
  }

  const blob = new Blob([source], {
    type: "image/svg+xml;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  return url;
}

export function createPngBlobFromSvg(svg: SVGSVGElement) {
    return new Promise<string>((resolve, reject) => {
        const scale = window.devicePixelRatio || 1;

        const width = svg.clientWidth;
        const height = svg.clientHeight;

        const svgBlobUrl = createSvgBlobFromSvg(svg);
        const img = new Image();

        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = width * scale;
            canvas.height = height * scale;

            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            ctx.setTransform(scale, 0, 0, scale, 0, 0);
            ctx.drawImage(img, 
                0, 0, width, height
            );

            canvas.toBlob(blob => {
                if(!blob) {
                    reject(new Error("Couldn't create blob from canvas"));
                    return;
                }

                resolve(URL.createObjectURL(blob));
            }, "image/png");
        };

        img.src = svgBlobUrl;
    });
}

export function openBlobInWindow(url: string) {
    window.open(url, "_blank");
}

export function saveBlobToFile(url: string, ext: string) {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');

    const a = document.createElement("a");
    
    a.href = url;
    a.download = `image-${timestamp}.${ext}`;
    a.click();
}