package main

import (
	"fmt"
	"net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello from heavy service\n")
}

func main() {
	http.HandleFunc("/health", handler)
	fmt.Println("heavy service listening on :8080")
	http.ListenAndServe(":8080", nil)
}
