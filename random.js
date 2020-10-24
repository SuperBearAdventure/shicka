function splitMix64(state) {
	let result = state.seed;
	state.seed = BigInt.asUintN(64, result + 0x9E3779B97f4A7C15n);
	result = BigInt.asUintN(64, BigInt.asUintN(64, result ^ BigInt.asUintN(64, result >> 30n)) * 0xBF58476D1CE4E5B9n);
	result = BigInt.asUintN(64, BigInt.asUintN(64, result ^ BigInt.asUintN(64, result >> 27n)) * 0x94D049BB133111EBn);
	return BigInt.asUintN(64, result ^ BigInt.asUintN(64, result >> 31n));
}
export function* xorShift128(seed) {
	seed = BigInt.asUintN(64, seed);
	const splitMixState = {seed};
	const i = splitMix64(splitMixState);
	const j = splitMix64(splitMixState);
	let a = BigInt.asUintN(32, i);
	let b = BigInt.asUintN(32, i >> 32n);
	let c = BigInt.asUintN(32, j);
	let d = BigInt.asUintN(32, j >> 32n);
	for (;;) {
		d = BigInt.asUintN(32, d ^ BigInt.asUintN(32, d << 11n));
		d = BigInt.asUintN(32, d ^ BigInt.asUintN(32, d >> 8n));
		d = BigInt.asUintN(32, BigInt.asUintN(32, d ^ a) ^ BigInt.asUintN(32, a >> 19n));
		yield d;
		[a, b, c, d] = [d, a, b, c];
	}
}
function knuth(state) {
	return BigInt.asUintN(32, state * 2654435761n);
}
export function* xorShift32(seed) {
	seed = BigInt.asUintN(64, seed);
	let t = knuth(seed);
	for (;;) {
		t = BigInt.asUintN(32, t ^ BigInt.asUintN(32, t << 13n));
		t = BigInt.asUintN(32, t ^ BigInt.asUintN(32, t >> 17n));
		t = BigInt.asUintN(32, t ^ BigInt.asUintN(32, t << 5n));
		yield t;
	}
}
