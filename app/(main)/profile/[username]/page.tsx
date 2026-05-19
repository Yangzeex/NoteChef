export default function ProfilePage({ params }: { params: { username: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">@{params.username}</h1>
    </div>
  );
}
