import { ArrowLeft, HelpCircle, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../lib/dexie/dexie";
import { CurrencyIcon } from "../../components/CurrencyIcon";
import { Spinner } from "../../components/Spinner";
import { formatCurrency } from "../../lib/currency";

import { callServer } from "../../lib/helpers";

export default function OrdersPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const localOrders = useLiveQuery(() =>
    db.orders.orderBy("createdAt").reverse().toArray(),
  );
  const orders = localOrders || [];

  useEffect(() => {
    const fetchOrders = async () => {
      const result = await callServer("/order/customer");
      if (result.success) {
        const data = result.data;
        const fetchedOrders = data.orders || data.data || data;
        const validOrders = Array.isArray(fetchedOrders) ? fetchedOrders : [];
        if (validOrders.length > 0) {
          await db.orders.bulkPut(validOrders);
        }
      }
      setIsLoading(false);
    };

    fetchOrders();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="flex items-center p-4 justify-between border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => navigate(-1)}
            className="flex size-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <ArrowLeft
              className="text-slate-900 dark:text-slate-100"
              size={24}
            />
          </button>
          <h1 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
            My Orders
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full min-h-[50vh]">
            <Spinner />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh] p-6 text-center space-y-4 animate-in fade-in duration-500">
            <div className="h-24 w-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2">
              <ShoppingBag className="text-slate-400" size={40} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              No Orders Yet
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
              Looks like you haven't placed any orders yet. Try exploring our
              menu and grab something delicious!
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all hover:bg-primary/90"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <section className="p-4 space-y-4 animate-in fade-in duration-500">
            {orders.map((order: any) => (
              <div
                key={order.id}
                className="flex flex-col gap-4 rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1.5">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        order.status === "DELIVERED" ||
                        order.status === "COMPLETED"
                          ? "text-green-600 dark:text-green-400"
                          : order.status === "CANCELLED"
                            ? "text-red-500"
                            : "text-primary"
                      }`}
                    >
                      {order.status || "Processing"}
                    </span>
                    <p className="text-slate-900 dark:text-slate-100 text-lg font-bold">
                      Order #
                      {order.id
                        ? order.id.toString().slice(-4).toUpperCase()
                        : "..."}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : "Today"}
                      {" • "}
                      {order.items?.length || 0} item
                      {order.items?.length !== 1 && "s"}
                    </p>
                  </div>

                  {order.items &&
                    order.items.length > 0 &&
                    order.items[0]?.menuItem?.imageUrl && (
                      <div
                        className="h-16 w-16 bg-slate-100 dark:bg-slate-700 rounded-lg bg-cover bg-center shrink-0 ml-4"
                        style={{
                          backgroundImage: `url('${order.items[0].menuItem.imageUrl}')`,
                        }}
                      ></div>
                    )}
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1 py-1">
                    {order.items
                      .map(
                        (i: any) => i.menuItem?.name || i.variantName || "Item",
                      )
                      .join(", ")}
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-700 mt-1">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Total
                  </p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    <CurrencyIcon />
                    {order.totalAmount
                      ? formatCurrency(Number(order.totalAmount))
                      : "0.00"}
                  </p>
                </div>

                {/* Optional Status Track / Help Action buttons for active orders */}
                {order.status !== "DELIVERED" &&
                  order.status !== "COMPLETED" &&
                  order.status !== "CANCELLED" && (
                    <div className="flex gap-2 pt-2">
                      <button className="flex-1 h-10 rounded-lg bg-primary text-white text-sm font-bold shadow-sm shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all">
                        Track Order
                      </button>
                      <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 active:scale-[0.98] transition-all">
                        <HelpCircle size={20} />
                      </button>
                    </div>
                  )}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
