#!/usr/bin/bash

# Define docker user and group id
DOCKER_UID=$(id -u)
DOCKER_GID=$(id -g)
USER=$(whoami)

# Import env variables from config/.env
# shellcheck disable=SC2046
export $(grep -v '^#' config/.env | xargs)

if [ "$MODE" = "test" ]; then
  echo "Running tests"
  docker compose -f docker-compose.test.yml "$@"
# Check if NODE_ENV is set to development
elif [ "$NODE_ENV" = "development" ]; then
  # Set the UID and GID to the current user
  export DOCKER_UID=$DOCKER_UID
  export DOCKER_GID=$DOCKER_GID
  export USER=USER
  echo "Running in development mode"
  docker compose -f docker-compose.yml -f docker-compose.dev.yml "$@"

else
  echo "Running in production mode"
  # Run docker compose with the default arguments
  docker compose "$@"
fi
