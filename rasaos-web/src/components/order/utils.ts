export const getStatusColor = (status: string) => {
  switch (status) {
    case "ACCEPTED":
    case "COMPLETED":
    case "READY":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400";
    case "PREPARING":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400";
    case "PENDING":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400";
    case "CANCELLED":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400";
    default:
      return "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300";
  }
};
