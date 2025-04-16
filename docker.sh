#!/usr/bin/bash

# Define docker user and group id
DOCKER_UID=$(id -u)
DOCKER_GID=$(id -g)
USER=$(whoami)

# Import env variables from config/.env
# shellcheck disable=SC2046
export $(grep -v '^#' config/.env | xargs)

# Check if NODE_ENV is set to development
if [ "$NODE_ENV" = "development" ]; then
  echo "Running in development mode"
  # Set the UID and GID to the current user
  export DOCKER_UID=$DOCKER_UID
  export DOCKER_GID=$DOCKER_GID
  export USER=USER

  # Run docker compose with the COMPOSE_ARGS
  docker compose -f docker-compose.yml -f docker-compose.dev.yml "$@"
else
  echo "Running in production mode"
  # Run docker compose with the default arguments
  docker compose "$@"
fi
