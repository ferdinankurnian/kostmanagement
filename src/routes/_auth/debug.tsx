import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_auth/debug")({
	component: DebugPage,
});

function DebugPage() {
	return (
		<div className="flex flex-col items-center justify-between h-full bg-white text-black py-8 px-6">
			{/* Center Content */}
			<div className="flex-1 flex flex-col items-center justify-center gap-3">
				<Loader2 className="size-8 animate-spin text-black stroke-[1.5]" />
				<p className="font-medium text-lg tracking-tight">Loading..</p>
			</div>

			{/* Bottom Buttons */}
			<div className="w-full max-w-[400px] flex flex-col gap-3">
				<Button asChild variant="secondary" className="w-full">
					<Link to="/admin/home">DEBUG: PEMILIK</Link>
				</Button>
				<Button asChild variant="secondary" className="w-full">
					<Link to="/member/home">DEBUG: PENGHUNI</Link>
				</Button>
			</div>
		</div>
	);
}
