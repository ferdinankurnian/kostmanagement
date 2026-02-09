import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_auth/login")({
	component: Login,
});

function Login() {
	const navigate = useNavigate();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		navigate({ to: "/debug" });
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="max-w-[400px] h-full flex items-center justify-center mx-auto"
		>
			<FieldGroup className="w-full">
				<FieldSet>
					<div className="mt-2">
						<h1 className="text-2xl mb-0">Hello</h1>
						<h1 className="text-2xl">Selamat Datang</h1>
					</div>
					<FieldGroup className="gap-4">
						<Field>
							<FieldLabel>Username</FieldLabel>
							<Input placeholder="Username" aria-label="Username" />
						</Field>
						<Field>
							<FieldLabel>Password</FieldLabel>
							<Input
								type="password"
								placeholder="Password"
								aria-label="Password"
							/>
						</Field>
					</FieldGroup>
				</FieldSet>
				<Field orientation="horizontal">
					<Button type="submit" className="w-full">
						Login
					</Button>
				</Field>
			</FieldGroup>
		</form>
	);
}
