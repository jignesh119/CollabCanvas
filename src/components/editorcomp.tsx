// import React, { useEffect, useRef, useState } from "react";
// import Editor from "@monaco-editor/react";
// import { Socket } from "socket.io-client";
// import * as Actions from "../Actions.json";
//
// interface IEditorProps {
//   socketRef: Socket | null;
//   roomId: string | undefined;
//   onCodeChange(code: string): any;
// }
//
// interface ActionsType {
//   [k: string]: string;
// }
// const EditorComp: React.FC<IEditorProps> = ({
//   socketRef,
//   roomId,
//   onCodeChange,
// }) => {
//   const [code, setCode] = useState<string | null>(null);
//   const editorRef = useRef(null);
//   const actions: ActionsType = Actions;
//   useEffect(() => {
//     (async () => {
//       if (socketRef) {
//         socketRef?.on(actions.CODE_CHANGE, ({ code }) => {
//           if (code) {
//             setCode(code);
//           }
//         });
//       }
//       return () => {
//         socketRef?.off(actions.CODE_CHANGE);
//       };
//     })();
//   }, [socketRef]);
//   const onMount = (editor: any) => {
//     editorRef.current = editor;
//     editor.focus();
//   };
//   const onChange = (v: string | undefined, ev: any) => {
//     setCode(v as string);
//     onCodeChange(v as string);
//     socketRef?.emit(actions.CODE_CHANGE, { roomId, code });
//   };
//   return (
//     <div>
//       <Editor
//         height="90vh"
//         language="javascript"
//         defaultValue="//some comment"
//         theme="vs-dark"
//         value={code as string}
//         onChange={onChange}
//         onMount={onMount}
//       />
//     </div>
//   );
// };
// export default EditorComp;
