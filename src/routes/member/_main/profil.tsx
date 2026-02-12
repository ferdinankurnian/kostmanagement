import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, UserCircle, Home, Phone, Bell, Lock, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/member/_main/profil")({
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
						<h1 className="text-xl">Penghuni</h1>
					</div>
				</div>
			</div>
			<div className="space-y-6 mt-6">
				<div className="space-y-2">
					<h1 className="text-lg">Data</h1>
					<div className="bg-white rounded-md">
						<Link to="/member/profil/informasi-diri">
							<div className="p-4 flex flex-row justify-between items-center gap-3 cursor-pointer">
								<div className="flex flex-row items-center gap-2">
									<UserCircle />
									Informasi Diri
								</div>
								<ChevronRight />
							</div>
						</Link>
						<Separator className="px-4" />
						<Link to="/member/profil/alamat-tinggal">
							<div className="p-4 flex flex-row justify-between items-center gap-3 cursor-pointer">
								<div className="flex flex-row items-center gap-2">
									<Home />
									Alamat Tinggal
								</div>
								<ChevronRight />
							</div>
						</Link>
						<Separator className="px-4" />
						<Link to="/member/profil/nomor-darurat">
							<div className="p-4 flex flex-row justify-between items-center gap-3 cursor-pointer">
								<div className="flex flex-row items-center gap-2">
									<Phone />
									Nomor Darurat
								</div>
								<ChevronRight />
							</div>
						</Link>
					</div>
				</div>
				<div className="space-y-2">
					<h1 className="text-lg">Pengaturan</h1>
					<div className="bg-white rounded-md">
						<Link to="/member/profil/pemberitahuan">
							<div className="p-4 flex flex-row justify-between items-center gap-3 cursor-pointer">
								<div className="flex flex-row items-center gap-2">
									<Bell />
									Pemberitahuan
								</div>
								<ChevronRight />
							</div>
						</Link>
						<Separator className="px-4" />
						<Link to="/member/profil/password">
							<div className="p-4 flex flex-row justify-between items-center gap-3 cursor-pointer">
								<div className="flex flex-row items-center gap-2">
									<Lock />
									Password
								</div>
								<ChevronRight />
							</div>
						</Link>
						<Separator className="px-4" />
						<Link to="/member/profil/peraturan">
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
