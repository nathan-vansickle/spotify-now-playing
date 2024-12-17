import { useState } from "react";
import "./App.css";
import "./components/AlbumArt";
import AlbumArt from "./components/AlbumArt";
import TrackInfo from "./components/TrackInfo";
import cover from "./assets/album.jpg";

function App() {
  const [track, setTrack] = useState("song!");

  return (
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
  );
}

export default App;
