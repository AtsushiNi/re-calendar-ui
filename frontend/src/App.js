import { useEffect, useState } from 'react'
import './App.css';

const App = () => {
  const url = "/users"
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetch(url, { method: "GET" })
      .then(res => res.json())
      .then(data => { setUsers(data) })
      .catch(err => {
        console.log(err)
      })
  }, [])

  return (
    <div className="App">
      <h1>Users</h1>
      {users.map((user, index) => <div key={index}>{user.name}</div>)}
    </div>
  );
}

export default App;
