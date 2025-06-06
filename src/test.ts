// 写个快速排序的方法
function quickSort(arr: number[]): number[] {
  if (arr.length <= 1) {
    return arr;
  }
  const pivot = arr[arr.length - 1]!; // Use non-null assertion as we've checked length > 1
  const left: number[] = [];
  const right: number[] = [];
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i]! < pivot) {
      left.push(arr[i]!);
    } else {
      right.push(arr[i]!);
    }
  }
  return [...quickSort(left), pivot, ...quickSort(right)];
}

const arr = [3, 6, 8, 10, 1, 2, 1];

quickSort(arr); // [1, 1, 2, 3, 6, 8, 10]
console.log(quickSort(arr));
