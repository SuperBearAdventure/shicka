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
export function nearest(search, candidates, count, stringify) {
	if (count === 0) {
		return [];
	}
	const results = [];
	for (const candidate of candidates) {
		const string = stringify(candidate);
		if (isSubsequence(search, string)) {
			const distance = string.length;
			results.push({candidate, distance});
		}
	}
	const lj = results.length;
	const li = lj < count ? lj : count;
	for (let i = 0; i < li; ++i) {
		let minItem = results[i];
		let minIndex = i;
		for (let j = i + 1; j < lj; ++j) {
			const item = results[j];
			if (item.distance < minItem.distance) {
				minItem = item;
				minIndex = j;
			}
		}
		if (minIndex !== i) {
			results[minIndex] = results[i];
			results[i] = minItem;
		}
	}
	if (li < lj) {
		results.length = li;
	}
	return results.map((result) => {
		return result.candidate;
	});
}
