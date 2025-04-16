[![Ruff](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json)](https://github.com/astral-sh/ruff)

# The Gateway – Community Tool

## Configuration

The required configuration that should be set before any deployment is located in the following directories:

- `backend/api/config`
- `backend/community_manager/config`
- `backend/core/config`
- `backend/indexer/config`
- `backend/transaction-lookup/.env`

Prepare this files according to `.env.template` which you could find in the mentioned places.



## Installation
To install and run the project, follow these steps:
- Docker and Docker Compose must be installed on your machine.
- Python 3 and pip should be installed to set up the virtual environment.
- Run `make setup-venv` to install all required dependencies and configure pre-commit hooks.
- Run `make build` to build the docker container.
- Run `make run` to start the project.

## Contributing
TBD
