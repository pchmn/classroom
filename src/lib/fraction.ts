export type Fraction = readonly [numerator: number, denominator: number];

export const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

export function addFractions([n1, d1]: Fraction, [n2, d2]: Fraction): Fraction {
  const n = n1 * d2 + n2 * d1;
  const d = d1 * d2;
  const g = gcd(n, d) || 1;
  return [n / g, d / g];
}

// Shows the fraction over `denominator` when it divides evenly, e.g. 3/4 over 100 is 75/100.
export function expandTo([n, d]: Fraction, denominator: number): Fraction {
  return (n * denominator) % d === 0 ? [(n * denominator) / d, denominator] : [n, d];
}
