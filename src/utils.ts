export function arrayFormater(arr: string[][]) {
  return arr.map(row => {
    row[1] = ' '.repeat(8) + row[1];
    return row;
  });
}
