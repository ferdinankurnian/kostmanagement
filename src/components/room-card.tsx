import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Status kamar: 'kosong' | 'terisi' | 'bermasalah'
export type RoomStatus = 'kosong' | 'terisi' | 'bermasalah';

interface RoomCardProps {
	roomNumber: number;
	status: RoomStatus;
}

export function RoomCard({ roomNumber, status }: RoomCardProps) {
	const getCardStyles = () => {
		switch (status) {
			case 'kosong':
				return 'bg-linear-to-br from-white to-gray-200';
			case 'bermasalah':
				return 'bg-linear-to-br from-red-100 to-red-300 border-red-400';
			case 'terisi':
			default:
				return 'bg-linear-to-br from-white to-[#A7D9FF]';
		}
	};

	return (
		<Card className={`rounded-sm gap-1 p-3 ${getCardStyles()}`}>
			<CardHeader className="p-0">
				<div className="flex justify-between items-center">
					<h1 className="text-muted-foreground">Kamar</h1>
					{status === 'bermasalah' && <AlertCircle className="w-4 h-4 text-red-600" />}
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<h1 className="text-2xl">{roomNumber}</h1>
			</CardContent>
		</Card>
	);
}
