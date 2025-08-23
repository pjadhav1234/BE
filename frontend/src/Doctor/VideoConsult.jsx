// src/App.jsx
import React from "react";
import VideoCall from "../components/VideoCall";

function App() {
  return (
    <div>
      {/* Doctor view */}
      <VideoCall userType="Doctor" />

      {/* Patient view */}
      {/* On a separate browser/device, load this with different Peer ID */}
      {/* <VideoCall userType="Patient" /> */}
    </div>
  );
}

export default App;
