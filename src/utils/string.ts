function editDistance(a: string, b: string, substitution: boolean): number {
	if (a.length < b.length) {
		[a, b] = [b, a];
	}
	const li: number = a.length;
	const lj: number = b.length;
	if (lj === 0) {
		return li;
	}
	const costs: number[] = Array.from({length: lj}, (value: string, key: number): number => (key));
	for (let i: number = 0; i < li; ++i) {
		const item: string = a[i];
		let extracted: number = i - 1;
		let inserted: number = i;
		for (let j: number = 0; j < lj; ++j) {
			const substituted: number = extracted;
			extracted = costs[j];
			inserted = item !== b[j] ? Math.min(substitution ? substituted : Number.POSITIVE_INFINITY, extracted, inserted) + 1 : substituted;
			costs[j] = inserted;
		}
	}
	return costs[lj - 1] + 1;
}
function isSubsequence(needle: string, haystack: string): boolean {
	const li: number = needle.length;
	const lj: number = haystack.length;
	if (lj < li) {
		return false;
	}
	let i: number = 0;
	let j: number = 0;
	loop: while (i < li) {
		const item: string = needle[i++];
		while (j < lj) {
			if (item === haystack[j++]) {
				continue loop;
			}
		}
		return false;
	}
	return true;
}
export function nearest<Type>(search: string, candidates: Type[], count: number, stringify: (candidate: Type) => string): Type[] {
	if (count === 0) {
		return [];
	}
	type Item = {
		candidate: Type,
		distance: number,
	};
	const results: Item[] = [];
	for (const candidate of candidates) {
		const string: string = stringify(candidate);
		if (isSubsequence(search, string)) {
			const distance: number = string.length;
			results.push({candidate, distance});
		}
	}
	const lj: number = results.length;
	const li: number = lj < count ? lj : count;
	for (let i: number = 0; i < li; ++i) {
		let minItem: Item = results[i];
		let minIndex: number = i;
		for (let j: number = i + 1; j < lj; ++j) {
			const item: Item = results[j];
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
	return results.map((result: Item): Type => {
		return result.candidate;
	});
}
export function list(items: string[]): string {
	return items.map((item: string): string => {
		return `\u{2022} ${item}`;
	}).join("\n");
}
