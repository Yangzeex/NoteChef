export default function RecipePage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">Recipe {params.id}</h1>
    </div>
  );
}
