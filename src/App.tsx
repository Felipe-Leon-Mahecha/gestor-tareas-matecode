import { auth, db } from './services/firebase'

function App() {
  const firebaseConnected = Boolean(auth) && Boolean(db)

  return (
    <main>
      <h1>Gestor de Tareas - MateCode</h1>
      {firebaseConnected && <p>Firebase conectado</p>}
    </main>
  )
}

export default App
