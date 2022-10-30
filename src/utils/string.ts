export type Localized<Type> = {
	"en-US": Type,
	"fr": Type,
};
const groupsPattern: RegExp = /\$<([$0-9A-Z_a-z]*)>/gsu;
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
	return results.map<Type>((result: Item): Type => {
		return result.candidate;
	});
}
export function list(items: string[]): string {
	return items.map<string>((item: string): string => {
		return `\u{2022} ${item}`;
	}).join("\n");
}
function filter<K extends string, T, U extends T>(input: {[k in K]: T}, callback: (value: T, key: K, input: {[k in K]: T}) => value is U): {[k in K]: U} {
	return Object.assign<{[k in K]: U}, {[k in K]: U}>(Object.create(null), Object.fromEntries<T>(Object.entries<T>(input).filter<[K, U]>((entry: [string, T]): entry is [K, U] => {
		const [key, value]: [K, T] = entry as [K, T];
		return callback(value, key, input);
	})) as {[k in K]: U});
}
function map<K extends string, T, U>(input: {[k in K]: T}, callback: (value: T, key: K, input: {[k in K]: T}) => U): {[k in K]: U} {
	return Object.assign<{[k in K]: U}, {[k in K]: U}>(Object.create(null), Object.fromEntries<U>(Object.entries<T>(input).map<[K, U]>((entry: [string, T]): [K, U] => {
		const [key, value]: [K, T] = entry as [K, T];
		return [
			key,
			callback(value, key, input),
		];
	})) as {[k in K]: U});
}
function compile<Groups extends {[k in string]: () => string}>(template: string): (groups: Groups) => string {
	return (groups: Groups): string => {
		return template.replaceAll(groupsPattern, ($0: string, $1: string): string => {
			return groups[$1]() ?? $0;
		});
	};
}
export function compileAll<Groups extends {[k in string]: () => string}>(templates: Localized<string>): Localized<(groups: Groups) => string> {
	return map<keyof Localized<unknown>, string, (groups: Groups) => string>(templates, (template: string): (groups: Groups) => string => {
		return compile<Groups>(template);
	});
}
function compose<InputGroups extends {[k in string]: () => string}, OutputGroups extends {[k in string]: () => string}>(template: (groups: InputGroups & OutputGroups) => string, inputGroups: InputGroups): (outputGroups: OutputGroups) => string {
	return (outputGroups: OutputGroups): string => {
		return template({...outputGroups, ...inputGroups});
	};
}
export function composeAll<InputGroups extends {[k in string]: () => string}, OutputGroups extends {[k in string]: () => string}>(templates: Localized<(groups: InputGroups & OutputGroups) => string>, inputGroups: Localized<InputGroups>): Localized<(outputGroups: OutputGroups) => string> {
	return map<keyof Localized<unknown>, (groups: InputGroups & OutputGroups) => string, (groups: OutputGroups) => string>(templates, (template: (groups: InputGroups & OutputGroups) => string, locale: keyof Localized<unknown>): (groups: OutputGroups) => string => {
		return compose<InputGroups, OutputGroups>(template, inputGroups[locale]);
	});
}
export function localize<Type>(callback: (locale: keyof Localized<unknown>) => Type): Localized<Type> {
	return Object.assign(Object.create(null), {
		"en-US": callback("en-US"),
		"fr": callback("fr"),
	});
}
