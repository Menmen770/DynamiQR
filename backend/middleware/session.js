const session = require("express-session");
const MongoStore = require("connect-mongo");

function createSessionMiddleware() {
  let sessionStore;
  if (process.env.MONGO_URI) {
    sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    });
  } else {
    console.log("⚠️  Using in-memory session store (development mode)");
    sessionStore = new session.MemoryStore();
  }

  return session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    },
    store: sessionStore,
  });
}

module.exports = { createSessionMiddleware };
