import ToWatchList from './ToWatchList';

export default function CollectionsList({ collections }) {
    return (
        <div>
            {collections.map((collection, index) => (
                <div key={index} className="mt-6">
                    <h3 className="text-lg font-bold mb-2">{collection.name}</h3>
                    <ToWatchList items={collection.items} />
                </div>
            ))}
        </div>
    );
}