
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime,
  createParam,
} = require('./runtime/wasm.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}





/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  provider: 'provider',
  providerAccountId: 'providerAccountId',
  refresh_token: 'refresh_token',
  access_token: 'access_token',
  expires_at: 'expires_at',
  token_type: 'token_type',
  scope: 'scope',
  id_token: 'id_token',
  session_state: 'session_state'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  sessionToken: 'sessionToken',
  userId: 'userId',
  expires: 'expires'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  name: 'name',
  username: 'username',
  email: 'email',
  emailVerified: 'emailVerified',
  image: 'image',
  bio: 'bio',
  preferredCrypto: 'preferredCrypto',
  walletAddresses: 'walletAddresses'
};

exports.Prisma.VerificationTokenScalarFieldEnum = {
  identifier: 'identifier',
  token: 'token',
  expires: 'expires'
};

exports.Prisma.CampaignScalarFieldEnum = {
  id: 'id',
  title: 'title',
  shortDescription: 'shortDescription',
  description: 'description',
  fundingGoal: 'fundingGoal',
  currentAmount: 'currentAmount',
  deadline: 'deadline',
  category: 'category',
  mainImage: 'mainImage',
  website: 'website',
  walletAddress: 'walletAddress',
  cryptocurrencyType: 'cryptocurrencyType',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  active: 'active',
  goalReached: 'goalReached',
  fundsDistributed: 'fundsDistributed',
  userId: 'userId'
};

exports.Prisma.MediaScalarFieldEnum = {
  id: 'id',
  url: 'url',
  type: 'type',
  createdAt: 'createdAt',
  campaignId: 'campaignId'
};

exports.Prisma.SocialScalarFieldEnum = {
  id: 'id',
  platform: 'platform',
  url: 'url',
  createdAt: 'createdAt',
  campaignId: 'campaignId'
};

exports.Prisma.ContributionScalarFieldEnum = {
  id: 'id',
  amount: 'amount',
  originalAmount: 'originalAmount',
  donationCurrency: 'donationCurrency',
  transactionHash: 'transactionHash',
  donorWalletAddress: 'donorWalletAddress',
  message: 'message',
  anonymous: 'anonymous',
  createdAt: 'createdAt',
  refunded: 'refunded',
  userId: 'userId',
  campaignId: 'campaignId'
};

exports.Prisma.TransactionLogScalarFieldEnum = {
  id: 'id',
  type: 'type',
  amount: 'amount',
  currency: 'currency',
  status: 'status',
  apiResponse: 'apiResponse',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  contributionId: 'contributionId',
  campaignId: 'campaignId'
};

exports.Prisma.PaymentIntentScalarFieldEnum = {
  id: 'id',
  amount: 'amount',
  currency: 'currency',
  description: 'description',
  userId: 'userId',
  status: 'status',
  paymentId: 'paymentId',
  apiResponse: 'apiResponse',
  estimatedSolAmount: 'estimatedSolAmount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.AccountOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  provider: 'provider',
  providerAccountId: 'providerAccountId',
  refresh_token: 'refresh_token',
  access_token: 'access_token',
  token_type: 'token_type',
  scope: 'scope',
  id_token: 'id_token',
  session_state: 'session_state'
};

exports.Prisma.SessionOrderByRelevanceFieldEnum = {
  id: 'id',
  sessionToken: 'sessionToken',
  userId: 'userId'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.UserOrderByRelevanceFieldEnum = {
  id: 'id',
  name: 'name',
  username: 'username',
  email: 'email',
  image: 'image',
  bio: 'bio',
  preferredCrypto: 'preferredCrypto'
};

exports.Prisma.VerificationTokenOrderByRelevanceFieldEnum = {
  identifier: 'identifier',
  token: 'token'
};

exports.Prisma.CampaignOrderByRelevanceFieldEnum = {
  id: 'id',
  title: 'title',
  shortDescription: 'shortDescription',
  description: 'description',
  category: 'category',
  mainImage: 'mainImage',
  website: 'website',
  walletAddress: 'walletAddress',
  cryptocurrencyType: 'cryptocurrencyType',
  userId: 'userId'
};

exports.Prisma.MediaOrderByRelevanceFieldEnum = {
  id: 'id',
  url: 'url',
  type: 'type',
  campaignId: 'campaignId'
};

exports.Prisma.SocialOrderByRelevanceFieldEnum = {
  id: 'id',
  platform: 'platform',
  url: 'url',
  campaignId: 'campaignId'
};

exports.Prisma.ContributionOrderByRelevanceFieldEnum = {
  id: 'id',
  donationCurrency: 'donationCurrency',
  transactionHash: 'transactionHash',
  donorWalletAddress: 'donorWalletAddress',
  message: 'message',
  userId: 'userId',
  campaignId: 'campaignId'
};

exports.Prisma.TransactionLogOrderByRelevanceFieldEnum = {
  id: 'id',
  type: 'type',
  currency: 'currency',
  status: 'status',
  apiResponse: 'apiResponse',
  contributionId: 'contributionId',
  campaignId: 'campaignId'
};

exports.Prisma.PaymentIntentOrderByRelevanceFieldEnum = {
  id: 'id',
  currency: 'currency',
  description: 'description',
  userId: 'userId',
  status: 'status',
  paymentId: 'paymentId',
  apiResponse: 'apiResponse'
};


exports.Prisma.ModelName = {
  Account: 'Account',
  Session: 'Session',
  User: 'User',
  VerificationToken: 'VerificationToken',
  Campaign: 'Campaign',
  Media: 'Media',
  Social: 'Social',
  Contribution: 'Contribution',
  TransactionLog: 'TransactionLog',
  PaymentIntent: 'PaymentIntent'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "/Users/home/evolved/cryptostarterapp/cryptostarterapp/src/generated/prisma",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "darwin",
        "native": true
      }
    ],
    "previewFeatures": [
      "driverAdapters",
      "fullTextSearchPostgres"
    ],
    "sourceFilePath": "/Users/home/evolved/cryptostarterapp/cryptostarterapp/prisma/schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../../../.env"
  },
  "relativePath": "../../../prisma",
  "clientVersion": "6.6.0",
  "engineVersion": "f676762280b54cd07c770017ed3711ddde35f37a",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\ngenerator client {\n  provider        = \"prisma-client-js\"\n  output          = \"../src/generated/prisma\"\n  previewFeatures = [\"driverAdapters\", \"fullTextSearchPostgres\"]\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\n// NextAuth.js Models\nmodel Account {\n  id                String  @id @default(cuid())\n  userId            String\n  type              String\n  provider          String\n  providerAccountId String\n  refresh_token     String?\n  access_token      String?\n  expires_at        Int?\n  token_type        String?\n  scope             String?\n  id_token          String?\n  session_state     String?\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([provider, providerAccountId])\n}\n\nmodel Session {\n  id           String   @id @default(cuid())\n  sessionToken String   @unique\n  userId       String\n  expires      DateTime\n  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n}\n\nmodel User {\n  id              String          @id @default(cuid())\n  name            String?\n  username        String?         @unique\n  email           String?         @unique\n  emailVerified   DateTime?\n  image           String?\n  bio             String?\n  preferredCrypto String? // Preferred cryptocurrency for payments\n  walletAddresses Json? // JSON object to store multiple wallet addresses\n  accounts        Account[]\n  sessions        Session[]\n  campaigns       Campaign[]\n  contributions   Contribution[]\n  paymentIntents  PaymentIntent[]\n}\n\nmodel VerificationToken {\n  identifier String\n  token      String   @unique\n  expires    DateTime\n\n  @@unique([identifier, token])\n}\n\n// CryptoStarter Models\nmodel Campaign {\n  id                 String   @id @default(cuid())\n  title              String\n  shortDescription   String\n  description        String\n  fundingGoal        Float\n  currentAmount      Float    @default(0)\n  deadline           DateTime\n  category           String\n  mainImage          String?\n  additionalMedia    Media[]\n  website            String?\n  socials            Social[]\n  walletAddress      String\n  cryptocurrencyType String // The cryptocurrency requested by campaign creator\n  createdAt          DateTime @default(now())\n  updatedAt          DateTime @updatedAt\n  active             Boolean  @default(true)\n  goalReached        Boolean  @default(false)\n  fundsDistributed   Boolean  @default(false)\n\n  userId String\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  contributions Contribution[]\n}\n\nmodel Media {\n  id        String   @id @default(cuid())\n  url       String\n  type      String // image or video\n  createdAt DateTime @default(now())\n\n  campaignId String\n  campaign   Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)\n}\n\nmodel Social {\n  id        String   @id @default(cuid())\n  platform  String\n  url       String\n  createdAt DateTime @default(now())\n\n  campaignId String\n  campaign   Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)\n}\n\nmodel Contribution {\n  id                 String   @id @default(cuid())\n  amount             Float // Amount in USD equivalent\n  originalAmount     Float // Original amount in donated currency\n  donationCurrency   String // Currency used for donation (ETH, BTC, SOL, etc.)\n  transactionHash    String? // Hash of the transaction for reference\n  donorWalletAddress String // Donor's wallet address for potential refunds\n  message            String?\n  anonymous          Boolean  @default(false)\n  createdAt          DateTime @default(now())\n  refunded           Boolean  @default(false)\n\n  userId String\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  campaignId String\n  campaign   Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)\n}\n\n// Transaction API Logs\nmodel TransactionLog {\n  id          String   @id @default(cuid())\n  type        String // donation, refund, distribution\n  amount      Float\n  currency    String\n  status      String // pending, completed, failed\n  apiResponse String? // Raw response from cryptoprocessing.io\n  createdAt   DateTime @default(now())\n  updatedAt   DateTime @updatedAt\n\n  contributionId String?\n  campaignId     String?\n}\n\n// Payment Intents\nmodel PaymentIntent {\n  id                 String   @id @default(cuid())\n  amount             Float\n  currency           String\n  description        String?\n  userId             String\n  status             String\n  paymentId          String   @unique\n  apiResponse        String\n  estimatedSolAmount Float?\n  createdAt          DateTime @default(now())\n  updatedAt          DateTime @updatedAt\n  user               User     @relation(fields: [userId], references: [id])\n\n  @@index([userId])\n}\n",
  "inlineSchemaHash": "5465b835fabcb068ed09c9d7c85b24179211aca7cb2de99cc84ea3221b5d412b",
  "copyEngine": false
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"Account\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"provider\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"providerAccountId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"refresh_token\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"access_token\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"expires_at\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"token_type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"scope\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"id_token\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"session_state\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"AccountToUser\"}],\"dbName\":null},\"Session\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"sessionToken\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"expires\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"SessionToUser\"}],\"dbName\":null},\"User\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"username\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"emailVerified\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"image\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"bio\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"preferredCrypto\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"walletAddresses\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"accounts\",\"kind\":\"object\",\"type\":\"Account\",\"relationName\":\"AccountToUser\"},{\"name\":\"sessions\",\"kind\":\"object\",\"type\":\"Session\",\"relationName\":\"SessionToUser\"},{\"name\":\"campaigns\",\"kind\":\"object\",\"type\":\"Campaign\",\"relationName\":\"CampaignToUser\"},{\"name\":\"contributions\",\"kind\":\"object\",\"type\":\"Contribution\",\"relationName\":\"ContributionToUser\"},{\"name\":\"paymentIntents\",\"kind\":\"object\",\"type\":\"PaymentIntent\",\"relationName\":\"PaymentIntentToUser\"}],\"dbName\":null},\"VerificationToken\":{\"fields\":[{\"name\":\"identifier\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"token\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"expires\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Campaign\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"shortDescription\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"fundingGoal\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"currentAmount\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"deadline\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"category\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"mainImage\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"additionalMedia\",\"kind\":\"object\",\"type\":\"Media\",\"relationName\":\"CampaignToMedia\"},{\"name\":\"website\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"socials\",\"kind\":\"object\",\"type\":\"Social\",\"relationName\":\"CampaignToSocial\"},{\"name\":\"walletAddress\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"cryptocurrencyType\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"active\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"goalReached\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"fundsDistributed\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"CampaignToUser\"},{\"name\":\"contributions\",\"kind\":\"object\",\"type\":\"Contribution\",\"relationName\":\"CampaignToContribution\"}],\"dbName\":null},\"Media\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"url\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"campaignId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"campaign\",\"kind\":\"object\",\"type\":\"Campaign\",\"relationName\":\"CampaignToMedia\"}],\"dbName\":null},\"Social\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"platform\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"url\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"campaignId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"campaign\",\"kind\":\"object\",\"type\":\"Campaign\",\"relationName\":\"CampaignToSocial\"}],\"dbName\":null},\"Contribution\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"amount\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"originalAmount\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"donationCurrency\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"transactionHash\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"donorWalletAddress\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"message\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"anonymous\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"refunded\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"ContributionToUser\"},{\"name\":\"campaignId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"campaign\",\"kind\":\"object\",\"type\":\"Campaign\",\"relationName\":\"CampaignToContribution\"}],\"dbName\":null},\"TransactionLog\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"amount\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"currency\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"apiResponse\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"contributionId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"campaignId\",\"kind\":\"scalar\",\"type\":\"String\"}],\"dbName\":null},\"PaymentIntent\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"amount\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"currency\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"paymentId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"apiResponse\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"estimatedSolAmount\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"PaymentIntentToUser\"}],\"dbName\":null}},\"enums\":{},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined
config.compilerWasm = undefined

config.injectableEdgeEnv = () => ({
  parsed: {
    DATABASE_URL: typeof globalThis !== 'undefined' && globalThis['DATABASE_URL'] || typeof process !== 'undefined' && process.env && process.env.DATABASE_URL || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

