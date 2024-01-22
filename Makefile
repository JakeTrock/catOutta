GO=go

default: build

get:
	$(GO) mod tidy

build:
	$(GO) build cmd/catoutta/catoutta.go

clean:
	rm catoutta

makeall:
	rm -rf bin/*

	mkdir -p bin/windows
	GOOS=windows GOARCH=amd64 go build -o bin/windows/win-amd64.exe cmd/catoutta/catoutta.go
	GOOS=windows GOARCH=arm64 go build -o bin/windows/win-arm64.exe cmd/catoutta/catoutta.go
	GOOS=windows GOARCH=386 go build -o bin/windows/win-386.exe cmd/catoutta/catoutta.go
	GOOS=windows GOARCH=arm go build -o bin/windows/win-arm.exe cmd/catoutta/catoutta.go

	mkdir -p bin/linux
	GOOS=linux GOARCH=amd64 go build -o bin/linux/lin-amd64 cmd/catoutta/catoutta.go
	GOOS=linux GOARCH=arm64 go build -o bin/linux/lin-arm64 cmd/catoutta/catoutta.go
	GOOS=linux GOARCH=386 go build -o bin/linux/lin-386 cmd/catoutta/catoutta.go
	GOOS=linux GOARCH=arm go build -o bin/linux/lin-arm cmd/catoutta/catoutta.go
	GOOS=linux GOARCH=mips go build -o bin/linux/lin-mips cmd/catoutta/catoutta.go
	GOOS=linux GOARCH=mips64 go build -o bin/linux/lin-mips64 cmd/catoutta/catoutta.go
	GOOS=linux GOARCH=mips64le go build -o bin/linux/lin-mips64le cmd/catoutta/catoutta.go
	GOOS=linux GOARCH=mipsle go build -o bin/linux/lin-mipsle cmd/catoutta/catoutta.go
	GOOS=linux GOARCH=ppc64 go build -o bin/linux/lin-ppc64 cmd/catoutta/catoutta.go
	GOOS=linux GOARCH=ppc64le go build -o bin/linux/lin-ppc64le cmd/catoutta/catoutta.go
	GOOS=linux GOARCH=riscv64 go build -o bin/linux/lin-riscv64 cmd/catoutta/catoutta.go
	GOOS=linux GOARCH=s390x go build -o bin/linux/lin-s390x cmd/catoutta/catoutta.go

	mkdir -p bin/mac
	GOOS=darwin GOARCH=amd64 go build -o bin/mac/mac-amd64 cmd/catoutta/catoutta.go
	GOOS=darwin GOARCH=arm64 go build -o bin/mac/mac-arm64 cmd/catoutta/catoutta.go

	mkdir -p bin/bsd
	GOOS=freebsd GOARCH=amd64 go build -o bin/bsd/fbsd-amd64 cmd/catoutta/catoutta.go
	GOOS=freebsd GOARCH=arm64 go build -o bin/bsd/fbsd-arm64 cmd/catoutta/catoutta.go
	GOOS=openbsd GOARCH=amd64 go build -o bin/bsd/obsd-amd64 cmd/catoutta/catoutta.go
	GOOS=openbsd GOARCH=arm64 go build -o bin/bsd/obsd-arm64 cmd/catoutta/catoutta.go
	GOOS=netbsd GOARCH=amd64 go build -o bin/bsd/nbsd-amd64 cmd/catoutta/catoutta.go
	GOOS=netbsd GOARCH=arm64 go build -o bin/bsd/nbsd-arm64 cmd/catoutta/catoutta.go
	GOOS=freebsd GOARCH=386 go build -o bin/bsd/fbsd-386 cmd/catoutta/catoutta.go
	GOOS=openbsd GOARCH=386 go build -o bin/bsd/obsd-386 cmd/catoutta/catoutta.go
	GOOS=netbsd GOARCH=386 go build -o bin/bsd/nbsd-386 cmd/catoutta/catoutta.go
	GOOS=freebsd GOARCH=arm go build -o bin/bsd/fbsd-arm cmd/catoutta/catoutta.go
	GOOS=openbsd GOARCH=arm go build -o bin/bsd/obsd-arm cmd/catoutta/catoutta.go
	GOOS=netbsd GOARCH=arm go build -o bin/bsd/nbsd-arm cmd/catoutta/catoutta.go
	GOOS=freebsd GOARCH=riscv64 go build -o bin/bsd/fbsd-riscv64 cmd/catoutta/catoutta.go
