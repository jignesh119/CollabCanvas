import React, { useEffect, useRef } from "react";
import Client from "./Client";
import Editor from "./Canvas";
import { initSocket } from "../io";
import { Socket } from "socket.io-client";
import * as Actions from "../Actions.json";
import {
  useLocation,
  useParams,
  useNavigate,
  Navigate,
} from "react-router-dom";
import toast from "react-hot-toast";
import Canvas from "./Canvas";

interface ActionsType {
  [k: string]: string;
}

const CanvasPage = () => {
  const socketRef = useRef<Socket | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const codeRef = useRef<string | null>(null);

  const [clients, setClients] = React.useState<
    { socketId?: string; username: string }[]
  >([{ username: location.state.username }]);

  const handleErrors = (err: Error) => {
    console.log(`Error with ws client: ${err}`);
    toast.error("socket connection failed");
    navigate("/");
  };

  if (!location.state) return <Navigate to={"/"} />;

  useEffect(() => {
    const actions: ActionsType = Actions;
    (async () => {
      socketRef.current = await initSocket();

      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));
      socketRef.current.on("ERR_CONNECTION_REFUSED", (err) => {
        handleErrors(err);
      });

      //im joining, chat
      socketRef.current.emit(actions.JOIN, {
        roomId,
        username: location.state?.username,
      });

      //usr just sild in
      socketRef.current.on(
        actions.USER_JOINED,
        ({ clients, username, socketId }) => {
          setClients(clients);
          if (username !== location.state.username) {
            toast.success(`${username} joined`);
          }
        },
      );
      socketRef.current.on(actions.DISCONNECTED, ({ socketId, username }) => {
        setClients((prev) => prev.filter((c) => c.socketId !== socketId));
        toast.success(`User ${username} disconnected`);
      });
    })();
    return () => {
      socketRef.current?.disconnect();
      socketRef.current?.off(actions.JOINED);
      socketRef.current?.off(actions.DISCONNECTED);
    };
  }, []);
  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId as string);
      toast.success("Room ID copied to clipboard");
    } catch (error) {
      console.log(`Error copying to clipboard: ${error}`);
      toast.error("Error copying to clipboard");
    }
  };
  const leaveRoom = () => {
    navigate("/");
  };

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img className="logoImage" src="/collab-canvas.png" alt="logo" />
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clients?.map((client) => (
              <Client
                key={client.socketId + Math.random().toString()}
                username={client.username}
              />
            ))}
          </div>
        </div>
        <button className="btn copyBtn" onClick={copyRoomId}>
          Copy ROOM ID
        </button>
        <button className="btn leaveBtn" onClick={leaveRoom}>
          Leave
        </button>
      </div>
      <div className="editorWrap">
        <Canvas
          socketRef={socketRef.current}
          roomId={roomId}
          onSketchChange={(code) => {
            codeRef.current = code as string;
          }}
        />
      </div>
    </div>
  );
};

export default CanvasPage;
