function editDistance(a, b, substitution) {
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
		const item = a[i];
		let extracted = i - 1;
		let inserted = i;
		for (let j = 0; j < lj; ++j) {
			const substituted = extracted;
			extracted = costs[j];
			inserted = item !== b[j] ? Math.min(substitution ? substituted : Number.POSITIVE_INFINITY, extracted, inserted) + 1 : substituted;
			costs[j] = inserted;
		}
	}
	return costs[lj - 1] + 1;
}
function isSubsequence(needle, haystack) {
	const li = needle.length;
	const lj = haystack.length;
	if (lj < li) {
		return false;
	}
	let i = 0;
	let j = 0;
	loop: while (i < li) {
		const item = needle[i++];
		while (j < lj) {
			if (item === haystack[j++]) {
				continue loop;
			}
		}
		return false;
	}
	return true;
}
export function nearest(search, candidates, stringify) {
	const {candidate} = candidates.reduce((accumulator, candidate) => {
		const string = stringify(candidate);
		if (!isSubsequence(search, string)) {
			return accumulator;
		}
		const distance = editDistance(search, string, false);
		if (distance < accumulator.distance) {
			return {candidate, distance};
		}
		return accumulator;
	}, {
		candidate: null,
		distance: Number.POSITIVE_INFINITY,
	});
	return candidate;
}
