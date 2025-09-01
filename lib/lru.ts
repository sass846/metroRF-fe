type NodeKey = string

export class LRUCache<V> {
  private capacity: number
  private map = new Map<NodeKey, V>()

  constructor(capacity = 10) {
    this.capacity = Math.max(1, capacity)
  }

  get(key: NodeKey): V | undefined {
    if (!this.map.has(key)) return undefined
    const val = this.map.get(key)!
    // move to end (most recently used)
    this.map.delete(key)
    this.map.set(key, val)
    return val
  }

  set(key: NodeKey, value: V) {
    if (this.map.has(key)) this.map.delete(key)
    this.map.set(key, value)
    if (this.map.size > this.capacity) {
      // delete least recently used (first)
      const firstKey = this.map.keys().next().value as NodeKey | undefined
      if (firstKey !== undefined) this.map.delete(firstKey)
    }
  }

  toArray(): [NodeKey, V][] {
    return Array.from(this.map.entries()).reverse() // most recent first
  }

  static fromArray<V>(arr: [NodeKey, V][], capacity = 10): LRUCache<V> {
    const lru = new LRUCache<V>(capacity)
    // restore with oldest first so most recent ends up at the end
    for (const [k, v] of arr.reverse()) lru.set(k, v)
    return lru
  }
}

export function routeKey(start: string, end: string) {
  return `${start.trim().toLowerCase()}→${end.trim().toLowerCase()}`
}
