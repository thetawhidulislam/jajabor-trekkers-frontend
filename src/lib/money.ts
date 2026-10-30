const MONEY_PATTERN = /^(-?)(\d+)(?:\.(\d{1,2}))?$/;

export function takaToMinorUnits(amount: string | number): number {
  const text = typeof amount === "number" ? String(amount) : amount.trim();
  const match = MONEY_PATTERN.exec(text);
  if (!match) {
    throw new RangeError("Enter an amount with at most two decimal places.");
  }

  const amountMinor = BigInt(match[2]) * BigInt(100) + BigInt((match[3] ?? "").padEnd(2, "0"));
  if (amountMinor > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new RangeError("Amount exceeds the supported range.");
  }
  const minorUnits = Number(amountMinor);
  return match[1] === "-" ? -minorUnits : minorUnits;
}

export function positiveTakaToMinorUnits(amount: string | number): number {
  const amountMinor = takaToMinorUnits(amount);
  if (amountMinor <= 0) {
    throw new RangeError("Amount must be greater than zero.");
  }
  return amountMinor;
}

export function minorUnitsToTaka(amountMinor: number): number {
  if (!Number.isSafeInteger(amountMinor)) {
    throw new RangeError("Amount must be a safe integer number of minor units.");
  }
  return amountMinor / 100;
}

export function sumMinorUnits(amountsMinor: number[]): number {
  return amountsMinor.reduce((sum, amount) => {
    if (!Number.isSafeInteger(amount)) {
      throw new RangeError("Amount must be a safe integer number of minor units.");
    }
    const next = sum + amount;
    if (!Number.isSafeInteger(next)) {
      throw new RangeError("Amount exceeds the supported range.");
    }
    return next;
  }, 0);
}

export function splitEquallyMinor(
  totalMinor: number,
  participantIds: string[],
): Array<{ userId: string; amountMinor: number }> {
  if (!Number.isSafeInteger(totalMinor) || totalMinor < 0 || participantIds.length === 0) {
    throw new RangeError("An equal split needs a nonnegative amount and at least one member.");
  }
  if (new Set(participantIds).size !== participantIds.length) {
    throw new RangeError("A member can only appear once in a split.");
  }

  const orderedIds = [...participantIds].sort((left, right) =>
    left < right ? -1 : left > right ? 1 : 0,
  );
  const total = BigInt(totalMinor);
  const count = BigInt(orderedIds.length);
  const baseAmount = Number(total / count);
  const remainder = Number(total % count);
  return orderedIds.map((userId, index) => ({
    userId,
    amountMinor: baseAmount + (index < remainder ? 1 : 0),
  }));
}
