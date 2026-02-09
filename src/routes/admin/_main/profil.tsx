import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, CreditCard, FileText, Home, UserCircle, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/admin/_main/profil")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="space-y-4">
			<div className="flex flex-row justify-between items-center mt-3">
				<div className="flex flex-row items-center gap-3">
					<Avatar className="size-12">
						<AvatarImage src="https://github.com/shadcn.png" />
						<AvatarFallback>CN</AvatarFallback>
					</Avatar>
					<div>
						<h1 className="text-xl">Admin</h1>
					</div>
				</div>
			</div>
			<div className="space-y-6 mt-6">
				<div className="space-y-2">
					<h1 className="text-lg">Data</h1>
					<div className="bg-white rounded-md">
						<Link to="/admin/profil/informasi-pemilik">
							<div className="p-4 flex flex-row justify-between items-center gap-3 cursor-pointer">
								<div className="flex flex-row items-center gap-2">
									<UserCircle />
									Informasi Pemilik
								</div>
								<ChevronRight />
							</div>
						</Link>
						<Separator className="px-4" />
						<Link to="/admin/profil/informasi-kost">
							<div className="p-4 flex flex-row justify-between items-center gap-3 cursor-pointer">
								<div className="flex flex-row items-center gap-2">
									<Home />
									Informasi Kost
								</div>
								<ChevronRight />
							</div>
						</Link>
						<Separator className="px-4" />
						<Link to="/admin/profil/rekening">
							<div className="p-4 flex flex-row justify-between items-center gap-3 cursor-pointer">
								<div className="flex flex-row items-center gap-2">
									<CreditCard />
									Rekening
								</div>
								<ChevronRight />
							</div>
						</Link>
					</div>
				</div>
				<div className="space-y-2">
					<h1 className="text-lg">Pengaturan</h1>
					<div className="bg-white rounded-md">
						<div className="p-4 flex flex-row justify-between items-center gap-3">
							<div className="flex flex-row items-center gap-2">
								<Bell />
								Laporan
							</div>
							<ChevronRight />
						</div>
						<Separator className="px-4" />
						<Link to="/admin/profil/peraturan">
							<div className="p-4 flex flex-row justify-between items-center gap-3 cursor-pointer">
								<div className="flex flex-row items-center gap-2">
									<FileText />
									Peraturan Kost
								</div>
								<ChevronRight />
							</div>
						</Link>
					</div>
				</div>
			</div>
		</div>
	)
}
