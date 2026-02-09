import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	loader: () => {
		// Di sini tempatnya "middleware" redirect
		// Contoh: kalo belum login, lempar ke /login
		throw redirect({
			to: "/login",
		});
	},
	component: () => null,
});
