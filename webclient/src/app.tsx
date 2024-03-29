import { useState } from "preact/hooks";
import { showSaveFilePicker } from "native-file-system-adapter";
import { QrScanner } from "./qrscan";
import "./app.css";
import { base64ToBytes } from "./base64util";

export function App() {
  const [useScreenCapture, setUseScreenCapture] = useState(false);
  const [count, setCount] = useState(0);
  const [length, setLength] = useState(0);
  const [filename, setFilename] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [chunksTaken, setChunksTaken] = useState<boolean[]>([]);
  const [fileHandle, setFileHandle] =
    useState<FileSystemWritableFileStream | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const resetScanner = () => {
    setShowScanner(false);
    setCount(0);
    setLength(0);
    setFilename("");
    setMessages([]);
    setChunksTaken([]);
    setFileHandle(null);
  };

  const scanCode = async (code: string) => {
    //init packet template: catOutta!-{'length':%d,'filename':'%s'}
    if (count === 0 && length === 0 && !code.startsWith("catOutta!-")) {
      setMessages(["Please scan the init packet first"]);
    } else if (count === 0 && code.startsWith("catOutta!-")) {
      const codeJson = JSON.parse(code.substring(10));
      setFilename(codeJson.filename);
      setLength(codeJson.length);
      setMessages((m) => [...m, "scanned init packet"]);
      setChunksTaken(new Array(codeJson.length-1).fill(false));
    } else if(code === "CATOUTTAEND"){
      setMessages((m) => [...m, "scanned end packet"]);
      chunksTaken.forEach((chunk, i) => {
        if(!chunk){
          setMessages((m) => [...m, `missing chunk ${i}`]);
        }
      });
      if (count === length) {
        fileHandle?.close();
        resetScanner();
      }
    } else {
      const codeJson = JSON.parse(code);
      if(chunksTaken[codeJson.i]){
        setMessages((m) => [...m, `already scanned packet ${codeJson.i}`]);
        return;
      }
      //base64 from codejson to bytes
      const fileBts = base64ToBytes(codeJson.d);//TODO: untested
      const fileHash = codeJson.h;
      const fileBtsHash = await crypto.subtle.digest('SHA-256', codeJson.d);
      const fileBtsHashHex = [...new Uint8Array(fileBtsHash)].map(b => b.toString(16).padStart(2, '0')).join('');
      //verify filebts
      setMessages((m) => [...m, `${fileHash} -== ${fileBtsHashHex.substring(0,5)}`]);

      if(fileHash !== fileBtsHashHex.substring(0,5)){
        setMessages((m) => [...m, `packet ${codeJson.i} failed hash verification`]);
        setMessages((m) => [...m, `${fileBts}`]);
        return;
      }
      await fileHandle?.write(fileBts);
      
      setChunksTaken((c) => {
        c[codeJson.i] = true;
        return c;
      });
      
      setCount(c=>c+1);
      setMessages((m) => [...m, `scanned packet ${count}`]);
      if (count === length) {
        fileHandle?.close();
        resetScanner();
      }
    }
  };

  const initFile = async () => {
    const newFH = await showSaveFilePicker({
      suggestedName: `catOuttaFile-${Date.now()}`,
      excludeAcceptAllOption: false, // default
    }).then((fileHandle) => fileHandle.createWritable());
    setFileHandle(newFH);
  }

  return (
    <>
      <div>
        <h1 class="read-the-docs">&lt; ) \|/</h1>
        <h1 class="read-the-docs">&lt; ) /|\</h1>
      </div>
      <h1>CatOutta</h1>
      <p>get your stuff out, fast, foss.</p>
      {showScanner && (
        <div>
          <p>
            please scan the codes on your screen in order, the first is the most
            important
          </p>
            <QrScanner
              onDecode={(code) => scanCode(code)}
              onError={(error) => console.log(error?.message)}
              useScreenCapture={useScreenCapture}
            />
         
          count is {count}/{length} for file {filename}
          <div style={{ background: "gray", overflow: "scroll" }}>
            {messages.map((message) => (
              <p>{message}</p>
            ))}
          </div>
        </div>
      )}
      <div class="card">
        <h2>Get started</h2>
        <button
          onClick={() => {
            if (showScanner) {
              resetScanner();
            } else {
              setShowScanner(true);          
              initFile();
            }
          }}
        >
          {showScanner ? "Stop/reset" : "Start"} scanner
        </button>
        <p class="read-the-docs">use screen capture/camera:</p>
        <button onClick={() => setUseScreenCapture(!useScreenCapture)}>
          {useScreenCapture ? "Disable" : "Enable"} screen capture
        </button>
      </div>
      <p class="read-the-docs">Curious cat? Need the binary?</p>
      <a
        class="vite-link"
        href="https://github.com/JakeTrock/catOutta/"
        target="_blank"
      >
        It's all here!
      </a>
      <p class="read-the-docs">Want more file movey goodness?</p>
      <a
        class="vite-link"
        href="https://paracordchat.com"
        target="_blank"
      >
        Try paracord!
      </a>
      <a
        class="vite-link"
        href="https://geocrypt.me"
        target="_blank"
      >
        Or geocrypt
      </a>
    </>
  );
}
