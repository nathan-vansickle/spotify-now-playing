interface TrackInfoPropTypes {
  title: string;
  artist: string;
  album: string;
}

export default function AlbumArt({ title, artist, album }: TrackInfoPropTypes) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-white mr-14">
        <p className="text-center text-3xl font-bold mb-6">{title}</p>
        <p className="text-center text-lg mb-12">{artist}</p>
        <p className="text-center text-sm">{album}</p>
    </div>
  );
}
