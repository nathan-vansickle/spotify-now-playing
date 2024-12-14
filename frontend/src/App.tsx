import { useState } from 'react'
import './App.css'

function App() {
  const [track, setTrack] = useState('song!')

  return (
    <>
      <div>
        <h1>{track}</h1>
      </div>
    </>
  )
}

export default App
