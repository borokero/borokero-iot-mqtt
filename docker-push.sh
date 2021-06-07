#!/usr/bin/env bash

if [ -z "$VERSION" ]; then
    VERSION=$(node -e "console.log(require('./package.json').version)")
fi

if [ -z "$NAME" ]; then
    NAME=$(node -e "console.log(require('./package.json').name.split('/').pop())")
fi

PREFIX=$(node -e "console.log(require('./package.json')['docker-registry'] || '')")
if [ -z "$PREFIX" ]; then
    PREFIX=$(node -e "console.log(require('./package.json')['docker-user'] || '')")
fi

if [ -z "$PREFIX" ]; then
    echo "docker push requires either docker-registry or docker-user in package.json"
    exit 1
fi

echo "$VERSION"

docker tag "$NAME:$VERSION" "$PREFIX/$NAME"
docker push "$PREFIX/$NAME"
docker tag "$NAME:$VERSION" "$PREFIX/$NAME:$VERSION"
docker push "$PREFIX/$NAME:$VERSION"
docker tag -f "$NAME:$VERSION" "$PREFIX/$NAME:latest"
docker push "$PREFIX/$NAME:latest"