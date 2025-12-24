export function calculateLeftDotPositions(
	width: number,
	height: number,
	minSpacing: number,
	maxSpacing: number,
	offset: number = 20,
): [x: number, y: number][] {
	const perimeter = (width * 2) + (height * 2);

	const maxDots = Math.floor(perimeter / minSpacing);
	const minDots = Math.ceil(perimeter / maxSpacing);

	const totalDots = Math.min(maxDots, Math.max(minDots, 4));

	if (totalDots === 0) return [];

	const positions: [x: number, y: number][] = [];

	const verticalSideDots = Math.floor((height / perimeter) * totalDots);
	const horizontalSideDots = Math.floor((width / perimeter) * totalDots);

	function distributeDots(
		count: number,
		getPosition: (i: number) => [number, number],
	) {
		if (count <= 0) return;
		const step = 1 / (count + 1);
		for (let i = 1; i <= count; i++) {
			positions.push(getPosition(i * step));
		}
	}

	// Lewa strona
	distributeDots(verticalSideDots, t => [-offset, height * t]);

	// Górna strona
	distributeDots(horizontalSideDots, t => [width * t, -offset]);



	return positions;
}


export function calculateBottomDotPositions(
	width: number,
	height: number,
	minSpacing: number,
	maxSpacing: number,
	offset: number = 20,
): [x: number, y: number][] {
	const perimeter = (width * 2) + (height * 2);
	const maxDots = Math.floor(perimeter / minSpacing);
	const minDots = Math.ceil(perimeter / maxSpacing);
	const totalDots = Math.min(maxDots, Math.max(minDots, 4));

	if (totalDots === 0) return [];

	const positions: [x: number, y: number][] = [];

	const verticalSideDots = Math.floor((height / perimeter) * totalDots);
	const horizontalSideDots = Math.floor((width / perimeter) * totalDots);

	function distributeDots(
		count: number,
		getPosition: (t: number) => [number, number],
	) {
		if (count <= 0) return;
		const step = 1 / (count + 1);
		for (let i = 1; i <= count; i++) {
			positions.push(getPosition(i * step));
		}
	}

	// Lewa strona
	distributeDots(verticalSideDots, t => [-offset, height * t]);

	// Prawa strona
	distributeDots(verticalSideDots, t => [width + offset, height * t]);



	// Dolna strona
	distributeDots(horizontalSideDots, t => [width * (1 - t), height + offset]);

	return positions;
}




export function calculateRightDotPositions(
	width: number,
	height: number,
	minSpacing: number,
	maxSpacing: number,
	offset: number = 20,
): [x: number, y: number][] {
	const perimeter = (width * 2) + (height * 2);
	const maxDots = Math.floor(perimeter / minSpacing);
	const minDots = Math.ceil(perimeter / maxSpacing);
	const totalDots = Math.min(maxDots, Math.max(minDots, 4));

	if (totalDots === 0) return [];

	const positions: [x: number, y: number][] = [];

	// Proporcje liczby krzeseł
	const verticalSideDots = Math.floor((height / perimeter) * totalDots);
	const horizontalSideDots = Math.floor((width / perimeter) * totalDots);

	function distributeDots(
		count: number,
		getPosition: (t: number) => [number, number],
	) {
		if (count <= 0) return;
		const step = 1 / (count + 1);
		for (let i = 1; i <= count; i++) {
			positions.push(getPosition(i * step));
		}
	}

	// Pomijamy lewą stronę
	// distributeDots(verticalSideDots, t => [-offset, height * t]);

	// Top (góra)
	distributeDots(horizontalSideDots, t => [width * t, -offset]);

	// Right (prawa)
	distributeDots(verticalSideDots, t => [width + offset, height * t]);



	return positions;
}




export function calculateTopDotPositions(
	width: number,
	height: number,
	minSpacing: number,
	maxSpacing: number,
	offset: number = 20,
): [x: number, y: number][] {
	const perimeter = (width * 2) + (height * 2);

	const maxDots = Math.floor(perimeter / minSpacing);
	const minDots = Math.ceil(perimeter / maxSpacing);

	const totalDots = Math.min(maxDots, Math.max(minDots, 4));

	if (totalDots === 0) return [];

	const positions: [x: number, y: number][] = [];
	const verticalSideDots = Math.floor((height / perimeter) * totalDots);
	const horizontalSideDots = Math.floor((width / perimeter) * totalDots);

	function distributeDots(
		count: number,
		getPosition: (i: number) => [number, number],
	) {
		if (count <= 0) return;
		const step = 1 / (count + 1);
		for (let i = 1; i <= count; i++) {
			positions.push(getPosition(i * step));
		}
	}

	// Górna strona
	distributeDots(horizontalSideDots, t => [width * t, -offset]);

	// Dolna strona
	distributeDots(horizontalSideDots, t => [width * (1 - t), height + offset]);

	// Prawa strona — pominięta

	return positions;
}

export function calculateSquareTableSize(seats: number, spacing: number): { width: number; height: number } {
	const sides = 4;
	const chairsPerSide = Math.ceil(seats / sides);

	const length = chairsPerSide * spacing;


	return {
		width: length ,
		height: length ,
	};
}

export function calculateRequiredSpacing(
	desiredSeats: number,
	width: number,
	height: number,
	minSpacing: number = 40, // Minimum allowed spacing between chairs
): number {
	// Start with a reasonable maximum spacing
	let maxSpacing = Math.max(width, height);
	let minSearchSpacing = minSpacing;
	let currentSpacing = (maxSpacing + minSearchSpacing) / 2;

	// Binary search to find the appropriate spacing
	while (maxSpacing - minSearchSpacing > 0.5) { // 0.5 is precision threshold
		currentSpacing = (maxSpacing + minSearchSpacing) / 2;
		// @ts-expect-error
		const positions = calculateSquareDotPositions(
			width,
			height,
			currentSpacing - 1,
			currentSpacing,
		);

		if (positions.length > desiredSeats) {
			// Current spacing is too small, need larger spacing
			minSearchSpacing = currentSpacing;
		} else if (positions.length < desiredSeats) {
			// Current spacing is too large, need smaller spacing
			maxSpacing = currentSpacing;
		} else {
			// Found exact match
			break;
		}
	}

	return Math.max(minSpacing, currentSpacing);
}
