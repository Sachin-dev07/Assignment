import http from 'http';

interface Notification {
  ID: string;
  Type: 'Placement' | 'Result' | 'Event' | string;
  Message: string;
  Timestamp: string;
}

interface ScoredNotification extends Notification {
  score: number;
}

const TYPE_WEIGHTS: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

const API_URL = 'http://4.224.186.213/evaluation-service/notifications';
const TOP_N = 10;

function fetchNotifications(): Promise<Notification[]> {
  return new Promise((resolve, reject) => {
    http.get(API_URL, (res) => {
      let raw = '';
      res.on('data', (chunk: Buffer) => (raw += chunk.toString()));
      res.on('end', () => {
        try {
          const json = JSON.parse(raw);
          const list: Notification[] = Array.isArray(json) ? json : json.notifications ?? [];
          resolve(list);
        } catch (err) {
          reject(new Error(`JSON parse error: ${(err as Error).message}`));
        }
      });
    }).on('error', reject);
  });
}

function calcScore(n: Notification): number {
  const weight = TYPE_WEIGHTS[n.Type] ?? 0;
  const unixSeconds = Math.floor(new Date(n.Timestamp).getTime() / 1000);
  return weight * 1_000_000_000 + unixSeconds;
}

class MinHeap {
  private heap: ScoredNotification[] = [];
  get size() { return this.heap.length; }
  peek(): ScoredNotification | undefined { return this.heap[0]; }
  push(item: ScoredNotification): void {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }
  pop(): ScoredNotification | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) { this.heap[0] = last; this.sinkDown(0); }
    return top;
  }
  toSortedDesc(): ScoredNotification[] {
    return [...this.heap].sort((a, b) => b.score - a.score);
  }
  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].score <= this.heap[i].score) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }
  private sinkDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1, right = 2 * i + 2;
      if (left < n && this.heap[left].score < this.heap[smallest].score) smallest = left;
      if (right < n && this.heap[right].score < this.heap[smallest].score) smallest = right;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}

async function getPriorityInbox(): Promise<void> {
  console.log('Fetching notifications from API...');
  let notifications: Notification[];
  try {
    notifications = await fetchNotifications();
  } catch (err) {
    console.error('Failed to fetch notifications:', (err as Error).message);
    process.exit(1);
  }
  console.log(`Successfully fetched ${notifications.length} notifications.`);
  const heap = new MinHeap();
  for (const n of notifications) {
    const scored: ScoredNotification = { ...n, score: calcScore(n) };
    if (heap.size < TOP_N) {
      heap.push(scored);
    } else if (heap.peek() && scored.score > heap.peek()!.score) {
      heap.pop();
      heap.push(scored);
    }
  }
  const top10 = heap.toSortedDesc();
  console.log('\n--- TOP 10 PRIORITY NOTIFICATIONS ---');
  top10.forEach((n, idx) => {
    const weight = TYPE_WEIGHTS[n.Type] ?? 0;
    console.log(`#${idx + 1} [${n.Type.toUpperCase()}] Weight:${weight} Score:${n.score}`);
    console.log(`   ID: ${n.ID}`);
    console.log(`   Message: ${n.Message}`);
    console.log(`   Timestamp: ${n.Timestamp}`);
    console.log('---');
  });
  console.log('Priority Inbox processing complete.');
}

getPriorityInbox();
