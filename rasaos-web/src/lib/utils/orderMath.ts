import type {
  CartItem,
  Adjustment,
} from "../../app/restaurant/orders/new/page";

export interface OrderTotals {
  subtotal: number;
  adjustmentTotal: number;
  finalTotal: number;
}

export function calculateOrderTotals(
  cartItems: CartItem[],
  adjustments: Adjustment[],
): OrderTotals {
  const subtotal = cartItems.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);

  let currentLumpSum = subtotal;
  let netAdjustmentAmount = 0; // Negative = discount, Positive = surcharge/fee

  adjustments.forEach((adj) => {
    let adjAmount = 0;

    if (adj.mode === "FIXED") {
      adjAmount = adj.value * 100; // Assuming price is stored in cents
    } else if (adj.mode === "PERCENTAGE") {
      adjAmount = (currentLumpSum * adj.value) / 100;
    }

    if (adj.type === "DISCOUNT") {
      // Prevent discounts from making the total negative
      if (adjAmount > currentLumpSum) {
        adjAmount = currentLumpSum;
      }
      netAdjustmentAmount -= adjAmount;
      currentLumpSum -= adjAmount;
    } else {
      netAdjustmentAmount += adjAmount;
      currentLumpSum += adjAmount;
    }
  });

  return {
    subtotal,
    adjustmentTotal: netAdjustmentAmount,
    finalTotal: subtotal + netAdjustmentAmount,
  };
}
