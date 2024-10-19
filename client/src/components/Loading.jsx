import React, { useEffect, useState } from 'react';
import '../styles.css'
function Loading() {
const [message , setMessage] = useState('Connecting to Socket server...')
const [newMessage, setNewMessage] = useState('Initally it takes ~40seconds')
const [count , setCount] = useState(0)
  useEffect(()=>{

    const intervalOut = setInterval(()=>{
      setCount((prevC) => prevC + 1)
    },1000)
   const timeOut =  setTimeout(()=>{
      setMessage('Working on it...')
      setNewMessage('Taking more time than usual. ')
    }, 30000)
    const timeOut1 =  setTimeout(()=>{
      setMessage('Almost done.')
      setNewMessage('Sit back relax :)')
    }, 50000)

    return () => {
      clearInterval(intervalOut)
      clearTimeout(timeOut)
      clearTimeout(timeOut1)
    }
  }, [])
  return (
    <div className="loading-container">
      <div className="loader"></div>
      <p>{message}</p>
      <p> {newMessage} </p>
      <p>{count} s</p>
    </div>
  );
}

export default Loading;