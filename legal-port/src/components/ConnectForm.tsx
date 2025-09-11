import { useState } from 'react'
import logo from './../assets/react.svg'

interface ConnectFormProps {
  connectToVideo: (channelName: string) => void
}

export const ConnectForm = ({ connectToVideo }: ConnectFormProps) => {
  const [channelName, setChannelName] = useState('')
  const [invalidInputMsg, setInvalidInputMsg] = useState('')

  const handleConnect = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // trim spaces
    const trimmedChannelName = channelName.trim()
    
    // validate input: make sure channelName is not empty
    if (trimmedChannelName === '') {
      setInvalidInputMsg("Channel name can't be empty.") // show warning
      setChannelName('') // resets channel name value in case user entered blank spaces 
      return;
    } 
  
    connectToVideo(trimmedChannelName)
  }

  return (
    <form onSubmit={handleConnect}>
      <img src={logo} className="logo" alt="logo" />
      <div className="card">
        <input 
          id="channelName"
          type='text'
          placeholder='Channel Name'
          value={channelName}
          onChange={(e) => {
            setChannelName(e.target.value)
            setInvalidInputMsg('') // clear the error message
          }}
        />
        <button type="submit">Connect</button>
        {invalidInputMsg && <p style={{color: 'red'}}> {invalidInputMsg} </p>}
      </div>
    </form>
  )
}
