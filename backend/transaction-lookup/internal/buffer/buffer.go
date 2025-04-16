package buffer

import (
	"sync"
)

// RingBufferWithSearch — структура данных с кольцевым буфером и быстрым поиском
type RingBufferWithSearch struct {
	data  []uint32
	index int
	size  int
	count int
	set   map[uint32]struct{}
	mu    sync.Mutex
}

func NewRingBufferWithSearch(size int) *RingBufferWithSearch {
	return &RingBufferWithSearch{
		data: make([]uint32, size),
		size: size,
		set:  make(map[uint32]struct{}),
	}
}

func (rb *RingBufferWithSearch) AddIfNotExists(value uint32) bool {
	rb.mu.Lock()
	defer rb.mu.Unlock()

	if _, ok := rb.set[value]; ok {
		return false
	}

	if rb.count == rb.size {
		oldValue := rb.data[rb.index]
		delete(rb.set, oldValue)
	} else {
		rb.count++
	}

	rb.data[rb.index] = value
	rb.set[value] = struct{}{}
	rb.index = (rb.index + 1) % rb.size
	return true
}

// func (rb *RingBufferWithSearch) Add(value uint32) {
// 	rb.mu.Lock()
// 	defer rb.mu.Unlock()

// 	if rb.count == rb.size {
// 		oldValue := rb.data[rb.index]
// 		delete(rb.set, oldValue)
// 	} else {
// 		rb.count++
// 	}

// 	rb.data[rb.index] = value
// 	rb.set[value] = struct{}{}
// 	rb.index = (rb.index + 1) % rb.size
// }

// func (rb *RingBufferWithSearch) Exists(value uint32) bool {
// 	rb.mu.RLock()
// 	defer rb.mu.RUnlock()
// 	_, exists := rb.set[value]
// 	return exists
// }
