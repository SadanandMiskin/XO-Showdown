import React, { useEffect, useState } from 'react';
import '../styles.css'
function Loading() {
const [message , setMessage] = useState('Connecting to server...')
const [newMessage, setNewMessage] = useState('Please wait')
  useEffect(()=>{
    setTimeout(()=>{
      setMessage('Connection Failed :(')
      setNewMessage('Try again... ')
      
    }, 20000)
  })
  return (
    <div className="loading-container">
      <div className="loader"></div>
      <p>{message}</p>
      <p> {newMessage} </p>
    </div>
  );
}

export default Loading;