export default function CookbookPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">Cookbook {params.id}</h1>
    </div>
  );
}
