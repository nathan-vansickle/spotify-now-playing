interface TrackInfoPropTypes {
  title: string;
  artist: string;
  album: string;
}

export default function AlbumArt({ title, artist, album }: TrackInfoPropTypes) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center mr-14">
        <p className="text-center text-3xl font-bold mb-6">{title}</p>
        <p className="text-center text-xl mb-12">{artist}</p>
        <p className="text-center text-md">{album}</p>
    </div>
  );
}
