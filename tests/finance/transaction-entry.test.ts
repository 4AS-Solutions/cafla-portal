import assert from "node:assert/strict";
import test from "node:test";

import { resolveBoardTransactionEntry } from "../../src/lib/finance/transaction-entry";

test("uses one sign model for registered and pending Finance entries", () => {
  assert.equal(
    resolveBoardTransactionEntry({
      transactionType: "payment",
      amount: "50.00",
      paymentMethod: "zelle",
    }).amountCents,
    BigInt(5000),
  );
  assert.equal(
    resolveBoardTransactionEntry({
      transactionType: "manual_credit",
      amount: "34.00",
    }).amountCents,
    BigInt(3400),
  );
  assert.equal(
    resolveBoardTransactionEntry({
      transactionType: "manual_charge",
      amount: "34.00",
    }).amountCents,
    BigInt(-3400),
  );
  assert.equal(
    resolveBoardTransactionEntry({
      transactionType: "annual_membership_fee",
      amount: "50.00",
    }).amountCents,
    BigInt(-5000),
  );
  assert.equal(
    resolveBoardTransactionEntry({
      transactionType: "adjustment",
      amount: "10",
      adjustmentDirection: "cafla_owes_member",
    }).amountCents,
    BigInt(1000),
  );
  assert.equal(
    resolveBoardTransactionEntry({
      transactionType: "adjustment",
      amount: "10",
      adjustmentDirection: "member_owes_cafla",
    }).amountCents,
    BigInt(-1000),
  );
});

test("enforces payment method and adjustment direction consistently", () => {
  assert.throws(
    () =>
      resolveBoardTransactionEntry({
        transactionType: "payment",
        amount: "10",
      }),
    /Payment method/,
  );
  assert.throws(
    () =>
      resolveBoardTransactionEntry({
        transactionType: "manual_credit",
        amount: "10",
        paymentMethod: "cash",
      }),
    /only allowed/,
  );
  assert.throws(
    () =>
      resolveBoardTransactionEntry({
        transactionType: "adjustment",
        amount: "10",
      }),
    /adjustment direction/i,
  );
  assert.throws(
    () =>
      resolveBoardTransactionEntry({
        transactionType: "manual_charge",
        amount: "10",
        adjustmentDirection: "member_owes_cafla",
      }),
    /only allowed/,
  );
});
