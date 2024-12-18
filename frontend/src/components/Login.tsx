export default function Login() {
  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <button
        onClick={handleSpotifyLogin}
        className="rounded-full bg-[#1DB954] text-white font-sans font-bold px-8 py-4 text-3xl"
      >
        Login to Spotify
      </button>
    </div>
  );

  function handleSpotifyLogin() {
    window.location.href = `${import.meta.env.VITE_API_URL}/spotify/login`;
  }
}
