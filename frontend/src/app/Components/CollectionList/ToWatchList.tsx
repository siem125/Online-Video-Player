import Link from 'next/link';
import Image from 'next/image';

export default function ToWatchList({ items }: { items?: string[] }) {
    // Ensure items is always treated as an array
    const safeItems = Array.isArray(items) ? items : [];

    if (safeItems.length === 0) {
        return <p className="text-center text-gray-500">No items in your watchlist yet.</p>;
    }

    return (
        <div className="flex overflow-x-auto space-x-4 p-2">
            {safeItems.map((item, index) => {
                const [type, name] = item.split(' - ');
                return (
                    <div key={index} className="w-48 cursor-pointer">
                        <Link href={`/public/${type}/${name}`}>
                            <Image
                                src={`/public/${type}/${name}/cover.jpg`}
                                alt={name}
                                width={192}
                                height={288}
                                className="rounded-md"
                            />
                            <p className="text-center mt-2">{name}</p>
                        </Link>
                    </div>
                );
            })}
        </div>
    );
}
