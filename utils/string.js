function levenshtein(a, b) {
	if (a.length < b.length) {
		[a, b] = [b, a];
	}
	const li = a.length;
	const lj = b.length;
	if (lj === 0) {
		return li;
	}
	const costs = Array.from({length: lj}, (value, key) => (key));
	for (let i = 0; i < li; ++i) {
		let extracted = i - 1;
		let inserted = i;
		for (let j = 0; j < lj; ++j) {
			const substituted = extracted;
			extracted = costs[j];
			inserted = a[i] !== b[j] ? Math.min(substituted, extracted, inserted) + 1 : substituted;
			costs[j] = inserted;
		}
	}
	return costs[lj - 1] + 1;
}
export function nearest(search, array, stringify) {
	const {value} = array.reduce((accumulator, value) => {
		const distance = levenshtein(search, stringify(value));
		if (distance < accumulator.distance) {
			return {value, distance};
		}
		return accumulator;
	}, {
		value: null,
		distance: Number.POSITIVE_INFINITY,
	});
	return value;
}
