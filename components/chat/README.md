# /components/chat

React components for the AI chat sidebar.

## Component List

| Component | Description |
|---|---|
| `ChatSidebar.tsx` | Outer container — manages conversation state and streaming |
| `MessageList.tsx` | Scrollable list of all messages in the current conversation |
| `MessageBubble.tsx` | Single message — user bubble or agent bubble, with markdown rendering |
| `ChatInput.tsx` | Text input and send button at the bottom of the sidebar |

## How Streaming Works

1. User submits a question via `ChatInput`
2. `ChatSidebar` calls `POST /api/agent` with `fetch()` using a `ReadableStream`
3. The API route streams tokens back using the Vercel AI SDK or `TransformStream`
4. `ChatSidebar` reads the stream with a `reader = response.body.getReader()` loop
5. Each token chunk is appended to the in-progress assistant message in local state
6. `MessageList` re-renders on each chunk — the message appears word by word

## Connecting to `/api/agent`

The request body sent from the sidebar:
```typescript
{
  messages: { role: "user" | "assistant", content: string }[]
}
```

The response is a streaming plain-text body. The sidebar accumulates the chunks and treats them as the assistant's reply. On stream end, the complete message is committed to the conversation history.

## Error States

If the API call fails or returns an error response, the sidebar should:
- Display an error message in the chat (not a toast/modal)
- Keep the user's last message visible so they can retry
- Not clear the input field on error
