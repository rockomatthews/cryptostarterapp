
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


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

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

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
  walletAddress: 'walletAddress',
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
  walletAddress: 'walletAddress',
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
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
