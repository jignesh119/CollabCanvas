import { useDraw } from "../hooks/useDraw";
import { useEffect, useState } from "react";
import { ChromePicker } from "react-color";
import { drawLine } from "../utils/drawLine";
import { Socket } from "socket.io-client";

interface ICanvasProps {
  socketRef: Socket | null;
  roomId: string | undefined;
  onSketchChange(sketch: string): any;
}

const Canvas: React.FC<ICanvasProps> = ({
  socketRef,
  roomId,
  onSketchChange,
}) => {
  const { canvasRef, onMouseDown, clear } = useDraw({ onDraw: createLine });
  const [color, setColor] = useState<string>("#FFF");

  // host drawing
  function createLine({ prevPoint, currentPoint, ctx }: Draw) {
    socketRef?.emit("draw-line", { roomId, prevPoint, currentPoint, color });
    drawLine({ prevPoint, currentPoint, ctx, color });
  }

  type drawLineProps = {
    prevPoint: Point | null;
    currentPoint: Point;
    color: string;
  };
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");

    //HACK: send 2 emits one for page and 1 fr component
    //usr just sild in
    socketRef?.on("get-canvas-state", ({ socketId }) => {
      console.log("got get-canvas-state");

      if (!canvasRef.current?.toDataURL()) return;
      socketRef?.emit("canvas-state", {
        socketId,
        state: canvasRef.current.toDataURL(),
      });
    });
    //peers sent their canvas to just joined
    socketRef?.on("canvas-state-from-server", (state) => {
      console.log(`got canvas state from srvr`);

      const img = new Image();
      img.src = state;
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
      };
    });

    socketRef?.on(
      "draw-line",
      ({ prevPoint, currentPoint, color }: drawLineProps) => {
        if (!ctx) return;
        drawLine({ prevPoint, currentPoint, ctx, color });
      },
    );
    socketRef?.on("clear-canvas", () => {
      clear();
    });
    return () => {
      socketRef?.off("draw-line");
      socketRef?.off("clear-canvas");
      socketRef?.off("get-canvas-state");
      socketRef?.off("canvas-state-from-server");
    };
  }, [socketRef, canvasRef]);

  return (
    <div className="flex relative m-10 bg-white">
      <div className="absolute md:relative flex flex-col gap-8 p-10 justify-center items-center text-white ">
        <ChromePicker
          color={color}
          onChange={(e) => {
            setColor(e.hex);
          }}
        />
        <button
          onClick={() => {
            clear();
            socketRef?.emit("clear-canvas", { roomId });
          }}
          type="button"
          className="text-center p-2 rounded-md border border-black text-black"
        >
          Clear Canvas
        </button>
      </div>
      <canvas
        onMouseDown={() => {
          onMouseDown();
        }}
        ref={canvasRef}
        className="lg:w-[800px] lg:h-[800px] bg-white shadow-black shadow-s"
        width={"800px"}
        height={"800px"}
      ></canvas>
    </div>
  );
};
export default Canvas;
