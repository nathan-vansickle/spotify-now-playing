import { useEffect, useState } from "react";
import "./App.css";
import "./components/AlbumArt";
import AlbumArt from "./components/AlbumArt";
import TrackInfo from "./components/TrackInfo";
import cover from "./assets/album.jpg";

const BACKEND_URL = "http://localhost:5000";

function App() {
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("")
  const [track, setTrack] = useState(null);
  const [error, setError] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const newAccessToken = params.get("access_token")

    if (newAccessToken) {
      setAccessToken(newAccessToken)
    }

    window.history.replaceState({}, document.title, window.location.pathname)
  }, [])
  
  return (
    <div>
      {!accessToken ? (
        <button onClick={handleSpotifyLogin}>Login</button>
      ) : (
        <div>
          <div className="grid grid-cols-2 grid-rows-1 h-screen bg-[#49423B]">
            <AlbumArt imageUrl={cover} />
            <TrackInfo
              title="You're Gonna Go Far"
              artist="Noah Kahan"
              album="Stick Season (We'll All Be Here Forever)"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function handleSpotifyLogin() {
  window.location.href = `${BACKEND_URL}/spotify/login`
}

export default App;
