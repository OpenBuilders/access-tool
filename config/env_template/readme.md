# Environment Variables

## Configuration
To deploy application (locally or on the server), please copy `env_template` folder to the `env` folder and specify all the values.

## Available environment variables
| **Name**                             | **Type**  | **Is Required** | **Description**                                                                                   |
|--------------------------------------|-----------|------------------|---------------------------------------------------------------------------------------------------|
| **LITESERVER_HOST**                  | `string`  | Yes              | Host address of the LiteServer of TON Blockchain for transactions tracking.                       |
| **LITESERVER_KEY**                   | `string`  | Yes              | API key for the LiteServer of TON Blockchain for transactions tracking.                           |
| **IS_TESTNET**                       | `boolean` | No               | Specifies whether the environment is a testnet (default: `false`).                                |
| **IS_PUBLIC**                        | `boolean` | No               | Indicates if the service is public-facing (default: `true`).                                      |
| **WORKER_CONCURRENCY**               | `number`  | Yes              | Concurrency for workers.                                                                          |
| **STICKER_DOM_CONSUMER_ID**          | `string`  | Yes              | Consumer ID for the Sticker Store API integration.                                                |
| **STICKER_DOM_BASE_URL**             | `string`  | Yes              | Base URL for the Sticker Store API integration.                                                   |
| **STICKER_DOM_DATA_STORAGE_BASE_URL**| `string`  | Yes              | Base URL of the data storage for the Sticker Store API integration.                               |
| **STICKER_DOM_PRIVATE_KEY_PATH**     | `string`  | Yes              | Path to the private key file used by Sticker Store integration.                                   |
| **TELEGRAM_BOT_TOKEN**               | `string`  | Yes              | Token for the Telegram bot.                                                                       |
| **TELEGRAM_APP_ID**                  | `string`  | Yes              | Application ID for Telegram services.                                                             |
| **TELEGRAM_APP_HASH**                | `string`  | Yes              | Application hash for Telegram services.                                                           |
| **MYSQL_HOST**                       | `string`  | Yes              | Host address for the MySQL database.                                                              |
| **MYSQL_PORT**                       | `number`  | Yes              | Port number for the MySQL database (default: `3306`).                                             |
| **MYSQL_DATABASE**                   | `string`  | Yes              | Name of the MySQL database.                                                                       |
| **MYSQL_USER**                       | `string`  | Yes              | Username for the MySQL database.                                                                  |
| **MYSQL_PASSWORD**                   | `string`  | Yes              | Password for the MySQL database user.                                                             |
| **MYSQL_ROOT_PASSWORD**              | `string`  | Yes              | Root password for the MySQL database.                                                             |
| **REDIS_HOST**                       | `string`  | Yes              | Host address of the Redis instance.                                                               |
| **REDIS_PORT**                       | `number`  | Yes              | Port number of the Redis instance (default: `6379`).                                              |
| **REDIS_USERNAME**                   | `string`  | No               | Username for Redis authentication.                                                                |
| **REDIS_PASSWORD**                   | `string`  | No               | Password for Redis authentication.                                                                |
| **REDIS_DB**                         | `number`  | Yes              | Default Redis database to use for internal purposes                                               |
| **REDIS_TRANSACTION_DB**             | `number`  | Yes              | Redis database to use for transactions tracking service                                           |
| **REDIS_TRANSACTION_STREAM_NAME**    | `string`  | Yes              | Name of the Redis stream containing tracked transactions updates from teh transactions tracking service |
| **CDN_ACCESS_KEY**                   | `string`  | Yes              | Access key for the CDN service.                                                                   |
| **CDN_SECRET_KEY**                   | `string`  | Yes              | Secret key for the CDN service.                                                                   |
| **CDN_REGION**                       | `string`  | No               | Region for the CDN service (default: `auto`).                                                     |
| **CDN_ENDPOINT**                     | `string`  | Yes              | Endpoint URL for the CDN service.                                                                 |
| **CDN_BUCKET_NAME**                  | `string`  | Yes              | Name of the CDN storage bucket.                                                                   |
| **TON_API_KEY**                      | `string`  | Yes              | API key for the TON API.                                                                          |
| **ENV**                              | `string`  | Yes              | Specifies the environment (e.g., `development`, `staging`, `production`).                         |
| **JWT_SECRET_KEY**                   | `string`  | Yes              | Secret key for JWT (JSON Web Tokens) authentication that will be used for API.                    |
| **SENTRY_DNS**                       | `string`  | No               | DNS address for Sentry integration (used for error monitoring and tracking).                      |
| **INTERNAL_CDN_BASE_URL**            | `string`  | Yes              | Base URL for internal CDN service.                                                                |
| **ENABLE_MANAGER**                   | `boolean` | No               | Enables the Community Manager module (default: `1` or enabled).                                   |
| **ITEMS_PER_TASK**                   | `number`  | No               | Number of items to process per task (Community Manager module) (default: `200`).                  |

---

### Notes
1. Some variables are optional and have sensible defaults. Ensure you update them based on the requirements of your environment.
2. Sensitive data such as `LITESERVER_KEY`, `TELEGRAM_BOT_TOKEN`, `MYSQL_PASSWORD`, and other passwords or keys must be handled securely and not exposed in public repositories.
3. If a variable is not applicable in your environment, verify if the application can run without it before omitting.

Ensure that all required variables are correctly set before running the application to prevent runtime failures.
