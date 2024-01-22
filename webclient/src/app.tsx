import { useState } from 'preact/hooks'
import { showSaveFilePicker } from "native-file-system-adapter";
import {QrScanner} from '@yudiel/react-qr-scanner';
import './app.css'

export function App() {
  const [count, setCount] = useState(0)
  const [length, setLength] = useState(0)
  const [filename, setFilename] = useState('')
  const [fileHandle, setFileHandle] = useState<FileSystemWritableFileStream|null>(null)
  const [showScanner, setShowScanner] = useState(false);

  const resetScanner = () => {
    setShowScanner(false);
    setCount(0);
  }

  const scanCode = async (code: string) => {
    //init packet template: catOutta!-{'length':%d,'filename':'%s'}
    if (count === 0 && code.startsWith('catOutta!-')) {
      const codeJson = JSON.parse(code.substring(10));
      setFilename(codeJson.filename);
      setLength(codeJson.length);
      const fileHandle = await showSaveFilePicker({
				suggestedName: codeJson.filename??"catOuttaFile",
				excludeAcceptAllOption: false // default
			})
				.then((fileHandle) => fileHandle.createWritable())

      setFileHandle(fileHandle);
    } else {
      if (fileHandle) {
        await fileHandle.write(new TextEncoder().encode(code));
      }
      setCount(count + 1);
    }
    
  }

  return (
    <>
      <div>
        <h1 class="read-the-docs">&lt;  ) \|/</h1>
        <h1 class="read-the-docs">&lt;  ) /|\</h1>
      </div>
      <h1>CatOutta</h1>
      <p>get your stuff out, fast, foss.</p>
      {showScanner && <div>
        <p>please scan the codes on your screen in order, the first is the most important</p>
        <QrScanner
            onDecode={(code) => scanCode(code)}
            onError={(error) => console.log(error?.message)}
        />
        count is {count}/{length} for file {filename}
      </div>}
      <div class="card">
        <h2>Get started</h2>
        <button onClick={() => {
          if(showScanner) {
            resetScanner();
          } else {
            setShowScanner(true);
          }
        }}>
          {showScanner ? 'Start' : 'Stop/reset'} scanner
        </button>
      </div>
      <p class="read-the-docs">
        Curious cat? Need the binary?
      </p>
      <a
          class="vite-link"
          href="https://github.com/JakeTrock/catOutta/"
          target="_blank"
      >It's all here!</a>
    </>
  )
}
