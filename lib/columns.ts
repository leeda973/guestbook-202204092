/**
 * 카드를 왼쪽 열부터 차례로 나눠 담는다(i번째 → i mod n번째 열).
 * 각 열은 위에서 아래로 쌓이므로 높이가 제각각인 메이슨리 배치를 유지하면서 가로로 순서가 읽힌다.
 */
export function distributeToColumns<T>(items: readonly T[], columns: number): T[][] {
  const result: T[][] = Array.from({ length: columns }, () => []);
  items.forEach((item, i) => result[i % columns].push(item));
  return result;
}
