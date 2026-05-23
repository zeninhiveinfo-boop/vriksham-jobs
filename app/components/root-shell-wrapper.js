"use client";

import { usePathname } from "next/navigation";
import AppShell from "@/app/components/app-shell";
import { ConfirmDialogProvider } from "@/app/components/confirm-dialog";
import { ToastProvider } from "@/app/components/toast-provider";

const PUBLIC_PATHS = [
	"/",
	"/login",
	"/careers",
	"/forgot-password",
	"/reset-password",
	"/setup",
	"/employer/request-access",
];

function isPublicPath(pathname) {
	if (!pathname) return false;

	if (PUBLIC_PATHS.includes(pathname)) return true;

	if (pathname.startsWith("/careers/")) return true;
	if (pathname.startsWith("/client-review/")) return true;
    if (pathname.startsWith("/employer/")) return true;


	return false;
}

export default function RootShellWrapper({ children }) {
	const pathname = usePathname();
	const publicPage = isPublicPath(pathname);

	return (
		<ConfirmDialogProvider>
			{publicPage ? (
				<ToastProvider>{children}</ToastProvider>
			) : (
				<AppShell>{children}</AppShell>
			)}
		</ConfirmDialogProvider>
	);
}