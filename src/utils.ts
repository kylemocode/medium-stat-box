export function arrayFormater(arr: string[][]) {
  return arr.map(row => {
    row[1] = ' '.repeat(4) + row[1];
    return row;
  });
}
