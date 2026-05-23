Basically this extension was intended to send your page data to a server
so it can escape the hard javascript reality and use whatever language you want

This extension is dependant of a server and not works alone

CORS: origin = moz-extension://*

## GET
`http://localhost:12345/dosomething?dsCurrentURL=URL`

## POST
`http://localhost:1234/dosomething?dsCurrentURL=URL`
- when body appended
```json
{
	// your json
	"dsDocumentBody": "body..."
}
```