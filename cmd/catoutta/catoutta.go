package main

import (
	"fmt"
	"io"
	"os"
	"time"

	"github.com/jessevdk/go-flags"
	"github.com/mattn/go-colorable"
	"github.com/qpliu/qrencode-go/qrencode"

	"github.com/fumiyas/go-tty"
	qrc "github.com/jaketrock/catoutta/lib"
)

const MAX_DATA_SIZE = 256

type cmdOptions struct {
	Help                 bool   `short:"h" long:"help" description:"show this help message"`
	Inverse              bool   `short:"i" long:"invert" description:"invert color"`
	Delay                int    `short:"d" long:"delay" description:"delay between chunks"`
	ErrorCorrectionLevel int    `short:"e" long:"error-correction-level" description:"error correction level"`
	MaxSize              int    `short:"m" long:"max-size" description:"max size of chunk"`
	File                 string `short:"f" long:"file" description:"file to read from"`
}

func showHelp() {
	const v = `Usage: qrc [OPTIONS] [TEXT]

Options:
  -h, --help
    Show this help message
  -i, --invert
    Invert color
  -d, --delay
    Delay between chunks
  -e, --error-correction-level
    Error correction level
  -m, --max-size
    Max size of chunk
  -f, --file
    File to read from

	<  ) \|/
	<  ) /|\

Meow!
	Pipe in a file or provide a string as an argument.	
`

	os.Stderr.Write([]byte(v))
}

func pErr(format string, a ...interface{}) {
	fmt.Fprint(os.Stdout, os.Args[0], ": ")
	fmt.Fprintf(os.Stdout, format, a...)
}

func main() {
	ret := 0
	defer func() { os.Exit(ret) }()

	opts := &cmdOptions{}
	optsParser := flags.NewParser(opts, flags.PrintErrors)
	args, err := optsParser.Parse()
	if err != nil || len(args) > 1 {
		showHelp()
		ret = 1
		return
	}
	if opts.Help {
		showHelp()
		return
	}

	var text string
	if len(args) == 1 {
		text = args[0]
	} else if opts.File != "" {
		file, err := os.Open(opts.File)
		if err != nil {
			pErr("failed to open file: %v\n", err)
			ret = 1
			return
		}
		defer file.Close()

		textBytes, err := io.ReadAll(file)
		if err != nil {
			pErr("failed to read from file: %v\n", err)
			ret = 1
			return
		}
		text = string(textBytes)
	} else {
		textBytes, err := io.ReadAll(os.Stdin)
		if err != nil {
			pErr("read from stdin failed: %v\n", err)
			ret = 1
			return
		}
		text = string(textBytes)
	}

	var maxsize int
	var eclevel qrencode.ECLevel
	var fname string

	if opts.MaxSize > 0 {
		maxsize = opts.MaxSize
	} else {
		maxsize = MAX_DATA_SIZE
	}

	if opts.ErrorCorrectionLevel > 0 {
		eclevel = qrencode.ECLevel(opts.ErrorCorrectionLevel)
	} else {
		eclevel = qrencode.ECLevelM
	}

	if opts.File != "" {
		fname = opts.File
	} else {
		fname = "catOuttaFile"
	}

	// Split the text into chunks if it is larger than a QR code can fit
	chunks := splitTextIntoChunks(text, maxsize)

	fmt.Println("=========(Total Chunks(size ", maxsize, " / ", len(chunks), "))=========")
	fmt.Println("+++++++++[Error Correction Level: ", eclevel, "]+++++++++")

	da1, err := tty.GetDeviceAttributes1(os.Stdout)

	if err != nil {
		pErr("failed to get device attributes: %v\n", err)
		ret = 1
		return
	}

	// print the init code

	initCode := fmt.Sprintf("catOutta!-{'length':%d,'filename':'%s'}", len(chunks), fname)

	grid, err := qrencode.Encode(initCode, eclevel)

	if err == nil && da1[tty.DA1_SIXEL] {
		qrc.PrintSixel(os.Stdout, grid, opts.Inverse)
	} else {
		stdout := colorable.NewColorableStdout()
		qrc.PrintAA(stdout, grid, opts.Inverse)
	}

	for index, chunk := range chunks {
		//sleep for 1 second
		if opts.Delay > 0 {
			time.Sleep(time.Duration(opts.Delay) * time.Second)
		} else {
			time.Sleep(1 * time.Second)
		}

		fmt.Println("=========(Chunk", index+1, "of)=========", len(chunks))

		grid, err := qrencode.Encode(chunk, eclevel)
		if err != nil {
			pErr("encode failed: %v\n", err)
			ret = 1
			return
		}

		if err == nil && da1[tty.DA1_SIXEL] {
			qrc.PrintSixel(os.Stdout, grid, opts.Inverse)
		} else {
			stdout := colorable.NewColorableStdout()
			qrc.PrintAA(stdout, grid, opts.Inverse)
		}
	}
}

func splitTextIntoChunks(text string, chunkSize int) []string {
	var chunks []string
	for i := 0; i < len(text); i += chunkSize {
		end := i + chunkSize
		if end > len(text) {
			end = len(text)
		}
		chunks = append(chunks, text[i:end])
	}
	return chunks
}
