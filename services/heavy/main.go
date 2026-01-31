package main

import (
	"flag"
	"fmt"
	"net/http"
	"os"
)

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello from heavy service\n")
}

func main() {
	// Determine port from --port flag or PORT env var, default to 4000
	portFlag := flag.String("port", "", "port to listen on")
	flag.Parse()
	port := "4000"
	if *portFlag != "" {
		port = *portFlag
	} else if env := os.Getenv("PORT"); env != "" {
		port = env
	}
	addr := ":" + port

	http.HandleFunc("/health", handler)
	fmt.Printf("heavy service listening on %s\n", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		fmt.Fprintf(os.Stderr, "failed to start heavy service: %v\n", err)
		os.Exit(1)
	}
}
