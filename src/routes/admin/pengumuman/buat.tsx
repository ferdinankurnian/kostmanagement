import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useId } from "react";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/pengumuman/buat")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const judulId = useId();
	const fotoId = useId();
	const deskripsiId = useId();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: submit form
		navigate({ to: "/admin/pengumuman" });
	};

	return (
		<div className="space-y-4">
			<TopBar>
				<TopBarLeft>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate({ to: "/admin/pengumuman" })}
					>
						<ChevronLeft className="size-6" />
					</Button>
				</TopBarLeft>
				<TopBarCenter>
					<h1 className="text-lg whitespace-nowrap">Buat Pengumuman</h1>
				</TopBarCenter>
			</TopBar>
			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="space-y-2">
					<Label htmlFor={judulId}>Judul</Label>
					<Input id={judulId} placeholder="Masukkan judul pengumuman" />
				</div>
				<div className="space-y-2">
					<Label htmlFor={fotoId}>Foto (Opsional)</Label>
					<FileUpload
						id={fotoId}
						accept="image/*"
						onFilesSelected={(files) => console.log(files)}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor={deskripsiId}>Isi Pengumuman</Label>
					<Textarea
						id={deskripsiId}
						placeholder="Masukkan isi pengumuman"
						rows={6}
					/>
				</div>
				<Button type="submit" className="w-full" size="lg">
					Kirim
				</Button>
			</form>
		</div>
	);
}
