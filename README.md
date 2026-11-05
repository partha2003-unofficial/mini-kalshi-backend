# Mini Kalshi Backend

A RESTful backend API for a simplified prediction-market platform, inspired by [Kalshi](https://kalshi.com). Users sign up with a virtual wallet, create yes/no markets by staking an initial wager, let other users bet against them, and settle the market once the outcome is known.

Built with **Node.js, Express 5, MongoDB (Mongoose), Zod and JWT**.

---

## Features

- **JWT authentication**: signup / signin with bcrypt-hashed passwords and bearer-token protected routes
- **Virtual wallet**: add funds ("on-ramp"), view balance, and see a full transaction history
- **Market creation**: a user opens a market with a title, a side (`yes` / `no`), an initial wager and an expiry date
- **Wager-capped betting**: other users bet against the creator; total bets on a market can never exceed the creator's initial wager
- **Market resolution**: only the creator can resolve a market, which triggers automatic payouts / refunds
- **Request validation**: every request body is validated with Zod schemas
- **Wallet ledger**: every balance change (`onremp`, `created`, `bet`, `payout`, `refund`) is recorded as a wallet event

---

## Tech Stack

| Layer          | Technology                      |
| -------------- | ------------------------------- |
| Runtime        | Node.js (ES Modules)            |
| Framework      | Express 5                       |
| Database       | MongoDB + Mongoose 9            |
| Validation     | Zod 4                           |
| Auth           | jsonwebtoken, bcrypt            |
| Config         | dotenv                          |
| Dev tooling    | nodemon                         |

---

## Project Structure

```
mini-kalshi-backend/
├── package.json
└── src/
    ├── index.js                      # App entry point, route mounting
    ├── db.connection.js              # MongoDB connection
    ├── .env.example                  # Environment variable template
    ├── controller/
    │   ├── user.controlller.js       # signup, signin, balance, profile, transactions
    │   ├── market.controller.js      # create market, list markets, place bet, list bets
    │   └── resolveMarketController.js# resolve market and distribute payouts
    ├── middleware/
    │   └── auth.middleware.js        # JWT verification
    ├── model/
    │   ├── user.model.js
    │   ├── market.model.js
    │   ├── bet.model.js
    │   └── walletEvent.model.js
    ├── routes/
    │   ├── user.route.js
    │   ├── maket.route.js
    │   └── resolve.route.js
    ├── services/
    │   ├── jwt.validation.services.js
    │   └── passwordHash.services.js
    └── validators/
        ├── user.validation.js
        ├── market.validation.js
        └── resolve.validation.js
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

```bash
git clone https://github.com/partha2003-unofficial/mini-kalshi-backend.git
cd mini-kalshi-backend
npm install
```

### Environment variables

Create a `.env` file in the project root (copy the template from `src/.env.example`):

```env
BACKEND_PORT=5000
DATABASE_CONNECTION_URL=mongodb://localhost:27017/mini_kalshi
SECRET_KEY_JWT=your_super_secret_key
```

| Variable                  | Description                          |
| ------------------------- | ------------------------------------ |
| `BACKEND_PORT`            | Port the server listens on           |
| `DATABASE_CONNECTION_URL` | MongoDB connection string            |
| `SECRET_KEY_JWT`          | Secret used to sign and verify JWTs  |

### Run the server

```bash
# development (auto-restart on changes)
npx nodemon src/index.js

# plain node
node src/index.js
```

The API is served at `http://localhost:<BACKEND_PORT>/api/v1`.

---

## How a Market Works

1. **Create**: User A creates a market, picks a side (`yes` or `no`) and locks an **initial wager** from their balance.
2. **Bet**: Other users place bets against User A. The sum of all bets on the market cannot exceed User A's initial wager. A creator cannot bet on their own market.
3. **Expire**: Markets whose expiry date has passed (or that are already resolved) no longer appear in the market listing and no longer accept bets.
4. **Resolve**: User A submits the final outcome (`yes` or `no`).
   - **Outcome matches the creator's side**: the creator wins and receives the pool (their wager plus all bets placed against them).
   - **Outcome does not match**: every bettor receives 2x their bet, and any unmatched part of the creator's wager is refunded to the creator.

All of these movements are written to the wallet ledger.

---

## Authentication

Protected routes require a JWT in the `Authorization` header:

```
Authorization: Bearer <token>
```

The token is returned by `POST /api/v1/user/signin`.

---

## API Reference

Base URL: `/api/v1`

### User: `/user`

| Method | Endpoint        | Auth | Description                          |
| ------ | --------------- | ---- | ------------------------------------ |
| POST   | `/signup`       | No   | Register a new user                  |
| POST   | `/signin`       | No   | Log in and receive a JWT             |
| PATCH  | `/onramp`       | Yes  | Add virtual funds to the wallet      |
| GET    | `/profile`      | Yes  | Get the current user's profile       |
| GET    | `/transection`  | Yes  | Get the current user's wallet events |

**POST `/user/signup`**

```json
{
  "userName": "alice",
  "email": "alice@example.com",
  "password": "secret123",
  "balance": 1000
}
```

Validation: `userName` 3 to 20 chars, `password` 6 to 20 chars, valid `email`, positive `balance`.

**POST `/user/signin`**

```json
{
  "userName": "alice",
  "password": "secret123"
}
```

**PATCH `/user/onramp`**

```json
{
  "balance": 500
}
```

### Market: `/market`

| Method | Endpoint  | Auth | Description                                   |
| ------ | --------- | ---- | --------------------------------------------- |
| POST   | `/`       | Yes  | Create a market                               |
| GET    | `/`       | No   | List all open (unexpired, unresolved) markets |
| POST   | `/bet`    | Yes  | Place a bet on a market                       |
| GET    | `/bets`   | Yes  | List the current user's bets                  |

**POST `/market`**

```json
{
  "title": "Will it rain in Kolkata tomorrow?",
  "initialWager": 200,
  "side": "yes",
  "expirey": "2026-12-31T18:00:00.000Z"
}
```

**POST `/market/bet`**

```json
{
  "marketId": "<market _id>",
  "betAmount": 50
}
```

### Resolve: `/resolve`

| Method | Endpoint          | Auth | Description                                   |
| ------ | ----------------- | ---- | --------------------------------------------- |
| POST   | `/resolvemarker`  | Yes  | Resolve a market (market creator only)        |

**POST `/resolve/resolvemarker`**

```json
{
  "marketId": "<market _id>",
  "resolution": "yes"
}
```

---

## Data Models

**User**: `userName` (unique), `email` (unique), `password` (hashed), `balance`

**Market**: `title`, `initialWager`, `side` (`yes` | `no`), `createrId`, `expirey`, `resolution` (`yes` | `no` | `null`)

**Bet**: `userId`, `marketId`, `betAmount`

**Wallet event**: `userId`, `tx_type` (`onremp` | `created` | `bet` | `payout` | `refund`), `externalId`, `amount`

---

## Testing the API

Any HTTP client works (Postman, Insomnia, `curl`). Typical flow:

1. `POST /user/signup` to create two users (a creator and a bettor)
2. `POST /user/signin` as each user and copy the tokens
3. `POST /market` as the creator
4. `POST /market/bet` as the bettor
5. `POST /resolve/resolvemarker` as the creator
6. `GET /user/profile` and `GET /user/transection` to check balances and the ledger

---

## Author

**Partha Pratim Samanta**

## License

ISC
