// utils/sort.ts
export function naturalSort(a: string, b: string): number {
    const aParts = a.split(/(\d+)/).map(p => (/\d+/.test(p) ? parseInt(p) : p.toLowerCase()));
    const bParts = b.split(/(\d+)/).map(p => (/\d+/.test(p) ? parseInt(p) : p.toLowerCase()));
  
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      if (aParts[i] === undefined) return -1;
      if (bParts[i] === undefined) return 1;
      if (aParts[i] < bParts[i]) return -1;
      if (aParts[i] > bParts[i]) return 1;
    }
    return 0;
  }
  