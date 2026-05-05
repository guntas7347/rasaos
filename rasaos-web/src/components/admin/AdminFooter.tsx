export default function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-6 px-4 sm:px-6 lg:px-8 border-t border-neutral-200 dark:border-neutral-800 mt-auto bg-white/50 dark:bg-neutral-950/50 backdrop-blur-sm relative z-0">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          &copy; {currentYear} RasaOS. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
          <a href="#" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Documentation</a>
          <a href="#" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
}
