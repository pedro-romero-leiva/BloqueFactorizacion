export function getFactors(n: number): [number, number] | null {
  if (n <= 3 || !Number.isInteger(n)) return null;

  if (n % 2 === 0) {
    if (n / 2 === 1) return null;
    return [2, n / 2];
  }

  const limit = Math.sqrt(n);
  for (let i = 3; i <= limit; i += 2) {
    if (n % i === 0) {
      if (n / i === 1) return null;
      return [i, n / i];
    }
  }

  return null;
}

export function isValidFactor(n: number, factor: number): boolean {
  if (
    !Number.isInteger(n) || 
    !Number.isInteger(factor) ||
    factor <= 1 ||
    factor >= n
  ) {
    return false;
  }
  return n % factor === 0;
}
