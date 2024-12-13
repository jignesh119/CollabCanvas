import React, { KeyboardEvent, KeyboardEventHandler, useState } from "react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const createNewRoom = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const id = uuidv4();
    setRoomId(id);
    toast.success("created new room", { position: "top-center" });
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("roomId and name are required");
      return;
    }

    //pass data from homepage to canvas page
    navigate(`/editor/${roomId}`, { state: { username } });
  };

  const handleInputEnter = (e: KeyboardEvent) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };
  return (
    <div className="homePageWrapper">
      <div className="formWrapper">
        <img
          className="homePageLogo"
          src="/collab-canvas.png"
          alt="collab-canvas-logo"
        />
        <h4 className="mainLabel">Paste invitation ROOM ID</h4>
        <div className="inputGroup">
          <input
            type="text"
            className="inputBox"
            placeholder="ROOM ID"
            onChange={(e) => setRoomId(e.target.value)}
            value={roomId}
            onKeyUp={handleInputEnter}
          />
          <input
            type="text"
            className="inputBox"
            placeholder="USERNAME"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            onKeyUp={handleInputEnter}
          />
          <button className="btn joinBtn" onClick={joinRoom}>
            Join
          </button>
          <span className="createInfo">
            If you don't have an invite then create &nbsp;
            <a onClick={createNewRoom} href="" className="createNewBtn">
              new room
            </a>
          </span>
        </div>
      </div>
      <footer>
        <h4>
          Built with 💛 &nbsp; by &nbsp;
          <a href="https://github.com/jignesh119">Jignesh119</a>
        </h4>
      </footer>
    </div>
  );
};

export default Home;
