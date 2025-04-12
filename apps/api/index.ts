import { Hono } from 'hono'
import { deckRoute } from './deckRoute';

const app = new Hono();

app.route("/api/decks", deckRoute )

export default app