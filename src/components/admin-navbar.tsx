import { Link } from "@tanstack/react-router";
import { Home, Megaphone, ScrollText, User } from "lucide-react";

export const AdminNavbar = () => {
	const activeClass = "bg-primary text-black shadow-md";
	const inactiveClass = "bg-transparent text-white hover:bg-black/5";

	return (
		<>
			<div className="w-full h-20 fixed left-0 right-0 bottom-0 bg-gradient-to-t from-[#F2F2F2] to-transparent pointer-events-none"></div>
			<nav className="max-w-xl flex justify-center items-center fixed bottom-4 left-4 right-4 mx-auto z-50 scale-110 origin-bottom">
				<div className="flex items-center gap-2 p-2 rounded-full bg-[#333333] border border-black/20 shadow-xl">
					<Link
						to="/admin"
						activeOptions={{ exact: true }}
						activeProps={{ className: activeClass }}
						inactiveProps={{ className: inactiveClass }}
						className="h-12 transition-all duration-300 ease-out flex items-center overflow-hidden rounded-full"
					>
						{({ isActive }) => (
							<div
								className={`flex items-center transition-all duration-300 ease-out ${
									isActive ? "px-5 w-auto" : "w-12 px-0 justify-center"
								}`}
							>
								<Home size={20} />
								<span
									className={`text-xs transition-all duration-300 ease-out whitespace-nowrap overflow-hidden ${
										isActive
											? "opacity-100 ml-2 max-w-[100px]"
											: "opacity-0 max-w-0 ml-0"
									}`}
								>
									Home
								</span>
							</div>
						)}
					</Link>
					<Link
						to="/admin/tagihan"
						activeProps={{ className: activeClass }}
						inactiveProps={{ className: inactiveClass }}
						className="h-12 transition-all duration-300 ease-out flex items-center overflow-hidden rounded-full"
					>
						{({ isActive }) => (
							<div
								className={`flex items-center transition-all duration-300 ease-out ${
									isActive ? "px-5 w-auto" : "w-12 px-0 justify-center"
								}`}
							>
								<ScrollText size={20} />
								<span
									className={`text-xs transition-all duration-300 ease-out whitespace-nowrap overflow-hidden ${
										isActive
											? "opacity-100 ml-2 max-w-[100px]"
											: "opacity-0 max-w-0 ml-0"
									}`}
								>
									Tagihan
								</span>
							</div>
						)}
					</Link>

					<Link
						to="/admin/pengumuman"
						activeProps={{ className: activeClass }}
						inactiveProps={{ className: inactiveClass }}
						className="h-12 transition-all duration-300 ease-out flex items-center overflow-hidden rounded-full"
					>
						{({ isActive }) => (
							<div
								className={`flex items-center transition-all duration-300 ease-out ${
									isActive ? "px-5 w-auto" : "w-12 px-0 justify-center"
								}`}
							>
								<Megaphone size={20} />
								<span
									className={`text-xs transition-all duration-300 ease-out whitespace-nowrap overflow-hidden ${
										isActive
											? "opacity-100 ml-2 max-w-[100px]"
											: "opacity-0 max-w-0 ml-0"
									}`}
								>
									Pengumuman
								</span>
							</div>
						)}
					</Link>

					<Link
						to="/admin/profil"
						activeProps={{ className: activeClass }}
						inactiveProps={{ className: inactiveClass }}
						className="h-12 transition-all duration-300 ease-out flex items-center overflow-hidden rounded-full"
					>
						{({ isActive }) => (
							<div
								className={`flex items-center transition-all duration-300 ease-out ${
									isActive ? "px-5 w-auto" : "w-12 px-0 justify-center"
								}`}
							>
								<User size={20} />
								<span
									className={`text-xs transition-all duration-300 ease-out whitespace-nowrap overflow-hidden ${
										isActive
											? "opacity-100 ml-2 max-w-[100px]"
											: "opacity-0 max-w-0 ml-0"
									}`}
								>
									Profil
								</span>
							</div>
						)}
					</Link>
				</div>
			</nav>
		</>
	);
};
