[![Ruff](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json)](https://github.com/astral-sh/ruff)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

# Access – Community Tool

![](.github/assets/access.mp4)

## Summary

Access is a comprehensive community management tool designed for blockchain and cryptocurrency communities.
It provides a suite of features to help community managers 
with managing access to their chats/channels based on the blockchain and other Telegram assets' data

### Key Features

- **Wallet Indexing**: Index blockchain wallets associated with community members
- **Transaction Lookup**: Track blockchain transactions for mentioned wallets
- **Community Management**: Tools for managing community members and activities
- **Scheduled Tasks**: Automated processes for regular community management activities

### Technology Stack

- **Backend**: Python with FastAPI, Celery for task processing, Golang for transaction tracking
- **Frontend**: React with TypeScript, built with Vite
- **Database**: MySQL
- **Caching & Message Queue**: Redis
- **Containerization**: Docker and Docker Compose
- **CI/CD**: GitHub Actions

## Installation

To install and run the project, follow these steps:

1. **Prerequisites**:
   - Docker and Docker Compose must be installed on your machine
   - Python 3.11.6 and pip should be installed to set up the virtual environment
   - Node.js and Yarn for frontend development (if needed)

2. **Setup**:
   - Clone the repository: `git clone https://github.com/openbuilders/gateway-tool.git`
   - Navigate to the project directory: `cd gateway-tool`
   - Set up the Python virtual environment: `make setup-venv`
   - Configure environment variables (see Configuration section)
   - Build the Docker containers: `make build`
   - Start the application: `make run`

3. **Verification**:
   - The API should be accessible at `http://localhost:8000`
   - The frontend should be accessible at `http://localhost:3000`

## Configuration

Check [configuration guide](config/env_template/readme.md)
to see how to deploy the application locally or on the server.

## Usage

### Available Commands

The project includes several make commands to simplify development and operation:

- `make build`: Build all Docker containers
- `make run`: Start all services
- `make stop`: Stop all services
- `make down`: Stop and remove containers
- `make restart`: Restart all services
- `make migrate`: Run database migrations
- `make test`: Run tests
- `make setup-venv`: Set up Python virtual environment

### Components

- **Backend**:
  - **API**: The main backend service that provides REST endpoints
  - **Indexer**: Processes and indexes blockchain, stickers and gifts data
  - **Community Manager**: Manages community-related operations
  - **Scheduler**: Handles scheduled tasks
  - **Transaction Lookup**: Provides transaction tracking functionality
- **Frontend**: User interface for the application

## Contributing

We welcome contributions to Access Community Tool! Here's how you can contribute:

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature-name`
3. Make your changes
4. Run tests: `make test`
5. Commit your changes: `git commit -m "Add some feature"`
6. Push to the branch: `git push origin feat/your-feature-name`
7. Submit a pull request

### Coding Standards

- Python code should follow PEP 8 guidelines and be formatted with Ruff
- TypeScript code should follow the project's ESLint configuration
- All code should include appropriate tests
- Commit messages should be clear and descriptive

### Testing

Before submitting a pull request, ensure that all tests pass:

```bash
make test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- The Gateway Community Tool is developed and maintained by independent developers and [Open Builders](https://github.com/openbuilders)
- Special thanks to all contributors who have helped shape this project
