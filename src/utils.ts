export function arrayFormater(arr: string[][]) {
  return arr.map(row => {
    row[1] = ' '.repeat(5) + row[1];
    return row;
  });
}
