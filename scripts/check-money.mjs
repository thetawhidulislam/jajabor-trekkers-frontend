import assert from "node:assert/strict";
import {
  minorUnitsToTaka,
  positiveTakaToMinorUnits,
  splitEquallyMinor,
  sumMinorUnits,
  takaToMinorUnits,
} from "../src/lib/money.ts";

assert.equal(takaToMinorUnits("125.40"), 12540);
assert.equal(takaToMinorUnits("0.01"), 1);
assert.equal(minorUnitsToTaka(12540), 125.4);
assert.equal(sumMinorUnits([12540, 1, -1]), 12540);
assert.equal(positiveTakaToMinorUnits("0.01"), 1);
assert.deepEqual(splitEquallyMinor(1001, ["b", "a", "c"]), [
  { userId: "a", amountMinor: 334 },
  { userId: "b", amountMinor: 334 },
  { userId: "c", amountMinor: 333 },
]);
assert.throws(() => takaToMinorUnits("1.001"), RangeError);
assert.throws(() => takaToMinorUnits("NaN"), RangeError);
assert.throws(() => minorUnitsToTaka(Number.NaN), RangeError);
assert.throws(() => positiveTakaToMinorUnits("-1"), RangeError);
assert.throws(() => positiveTakaToMinorUnits("0"), RangeError);
assert.throws(() => positiveTakaToMinorUnits("NaN"), RangeError);
assert.throws(() => positiveTakaToMinorUnits("1.001"), RangeError);

console.log("Money checks passed.");
