"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { callServer } from "../../../lib/helpers";
import toast from "react-hot-toast";
import { Loader2, ListOrdered, RefreshCw, Filter } from "lucide-react";
import { OrderCard } from "../../../components/order/OrderCard";
import { OrderDetailsModal } from "../../../components/order/OrderDetailsModal";
import { OrderFiltersModal } from "../../../components/order/OrderFiltersModal";
import { db } from "../../../lib/dexie/dexie";
import { OrderService } from "../../../lib/dexie/order-service";
import { SyncService } from "../../../lib/dexie/sync-service";

export default function ViewOrdersPage() {
  const { restaurant } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("ALL");

  // Pagination & API Filters
  const [page, setPage] = useState(1);
  const [dateFilter, setDateFilter] = useState<string>("");
  const [orderIdFilter, setOrderIdFilter] = useState<string>("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadOrdersFromDB = async () => {
    let collection = db.orders.orderBy("createdAt").reverse();

    if (dateFilter) {
      collection = collection.filter((o) => {
        if (o.createdAt) {
          return (
            new Date(o.createdAt).toISOString().split("T")[0] === dateFilter
          );
        }
        return false;
      });
    }

    if (orderIdFilter) {
      collection = collection.filter(
        (o) =>
          o.id === orderIdFilter ||
          o.serverOrderId === orderIdFilter ||
          o.clientOrderId === orderIdFilter,
      );
    }

    const result = await collection
      .offset((page - 1) * 20)
      .limit(20)
      .toArray();

    setOrders(result);
    return result;
  };

  const syncOrders = async () => {
    const toastId = toast.loading("Syncing orders...");
    const params = new URLSearchParams();
    params.append("page", page.toString());
    if (dateFilter) params.append("date", dateFilter);
    if (orderIdFilter) params.append("id", orderIdFilter);

    const response = await callServer(`/order?${params.toString()}`);

    if (response.success) {
      const data = response.data;
      let parsedOrders: any[] = [];

      if (Array.isArray(data)) {
        parsedOrders = data;
      } else if (data && typeof data === "object") {
        if (Array.isArray(data.data)) {
          parsedOrders = data.data;
        } else if (Array.isArray(data.orders)) {
          parsedOrders = data.orders;
        } else if (data.data && Array.isArray(data.data.orders)) {
          parsedOrders = data.data.orders;
        }
      }

      const validOrders = parsedOrders
        .filter((o) => o && o.id)
        .map((o) => ({
          ...o,
          clientOrderId: o.clientOrderId || o.id,
        }));

      // ==========================================
      // NEW SMART UPSERT LOGIC (Replaces bulkPut)
      // ==========================================
      if (validOrders.length > 0) {
        try {
          await db.transaction("rw", db.orders, async () => {
            for (const srvOrder of validOrders) {
              // 1. Look for an existing local order using the stable clientOrderId
              const existing = await db.orders
                .where("clientOrderId")
                .equals(srvOrder.clientOrderId)
                .first();

              // 2. If it exists but has a temporary local ID, delete the local one
              if (existing && existing.id !== srvOrder.id) {
                await db.orders.delete(existing.id);
              }

              // 3. Save the official server record
              await db.orders.put({
                ...srvOrder,
                syncStatus: "SYNCED",
                syncError: null,
              });
            }
          });
        } catch (error) {
          console.error("Dexie smart sync failed", error);
        }
      }
      // ==========================================

      await loadOrdersFromDB();
      toast.success("Orders synced", { id: toastId });
    } else {
      toast.error("Failed to sync orders", { id: toastId });
    }

    setIsLoading(false);
  };

  const loadInitial = async () => {
    setIsLoading(true);
    try {
      const result = await loadOrdersFromDB();
      if (result.length === 0) {
        await syncOrders();
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error loading from Dexie:", error);
      await syncOrders();
    }
  };

  const updateOrderStatus = async (
    clientOrderId: string,
    updates: {
      status?: string;
      paymentStatus?: string;
    },
  ) => {
    try {
      if (!updates.status) return;

      // 1. UPDATE LOCAL DB IMMEDIATELY
      await OrderService.updateStatus(
        clientOrderId,
        updates.status,
        updates.paymentStatus,
      );

      // 2. OPTIMISTIC UI UPDATE
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.clientOrderId === clientOrderId
            ? { ...order, status: updates.status, syncStatus: "LOCAL_ONLY" }
            : order,
        ),
      );

      toast.success(
        navigator.onLine ? "Status updated. Syncing..." : "Updated offline",
      );

      // 3. BACKGROUND SYNC
      if (navigator.onLine) {
        SyncService.syncOrder(clientOrderId).then((res) => {
          if (res?.success) {
            toast.success("Order synced");
            loadOrdersFromDB(); // Refresh local UI with server timestamps
          } else {
            toast.error("Sync failed, will retry later");
            loadOrdersFromDB(); // Refresh to show FAILED status
          }
        });
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update order locally");
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    const response = await callServer(`/order/${orderId}`, {
      method: "DELETE",
    });

    if (response.success) {
      toast.success(response.message || "Success");

      try {
        await db.orders.delete(orderId);
      } catch (e) {
        console.error("Failed to delete from dexie", e);
      }

      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId),
      );

      setSelectedOrder((prev: any) => {
        if (prev?.id === orderId) {
          setIsModalOpen(false);
          return null;
        }
        return prev;
      });
    }
  };

  useEffect(() => {
    if (restaurant) {
      loadInitial();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant, page, dateFilter, orderIdFilter]);

  const filteredOrders = useMemo(() => {
    if (filterType === "ALL") return orders;
    return orders.filter((o) => o.type === filterType);
  }, [orders, filterType]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-sm font-medium text-neutral-500">
          Loading orders...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <ListOrdered
              size={24}
              className="text-blue-600 dark:text-blue-500"
            />
            Orders
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            View and manage all incoming orders for your restaurant.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              syncOrders();
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm relative"
          >
            <Filter size={16} />
            <span className="hidden sm:inline">Filter</span>
            {(dateFilter || orderIdFilter) && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            )}
          </button>

          <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg shrink-0 overflow-x-auto">
            {["ALL", "DINE_IN", "TAKEAWAY", "DELIVERY"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${filterType === type ? "bg-white dark:bg-neutral-950 shadow-sm text-neutral-900 dark:text-white" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
              >
                {type.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
            <ListOrdered
              size={32}
              className="text-blue-600 dark:text-blue-500"
            />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
            No Orders Yet
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-sm">
            When customers place orders, they will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order: any) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => {
                setSelectedOrder(order);
                setIsModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-between items-center py-4 border-t border-neutral-200 dark:border-neutral-800 mt-6">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || isLoading}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          Previous
        </button>
        <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          Page {page}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={filteredOrders.length < 20 || isLoading}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          Next
        </button>
      </div>

      {/* Order Filters Modal */}
      <OrderFiltersModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        dateFilter={dateFilter}
        orderIdFilter={orderIdFilter}
        onApplyFilters={(date, id) => {
          setDateFilter(date);
          setOrderIdFilter(id);
          setPage(1); // Reset to first page when applying new filters
        }}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedOrder={selectedOrder}
        updateOrderStatus={updateOrderStatus}
        deleteOrder={deleteOrder}
      />
    </div>
  );
}
