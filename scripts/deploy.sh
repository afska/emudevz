#!/bin/bash

. ./scripts/try.sh

APP_NAME="emudevz"

USERNAME="$1"
TOKEN="$2"
REPO="https://$USERNAME:$TOKEN@github.com/$USERNAME/$APP_NAME"

function show_usage {
	echo "Usage example:"
	echo "./deploy.sh <GITHUB_USERNAME> <GITHUB_TOKEN>"
}

if [ -z "$USERNAME" ] || [ -z "$TOKEN" ] ; then
	show_usage
	exit 1
fi

function compile {
	try npm run build
}

function deploy {
	CURRENT_BRANCH=$(git branch --show-current)
	git branch -D deploy 2>/dev/null
	git remote remove ghpages 2>/dev/null
	try git checkout --orphan deploy
	try git reset
	try git add -f build/
	try git mv -f build/* .
	try git commit --no-verify -m "Deploy @ $(date +'%d/%m/%Y')"
	try git remote add ghpages "$REPO"
	try git push -f ghpages deploy:gh-pages
	try git checkout -f "$CURRENT_BRANCH"
}

echo "--- Compiling... ---"
compile

echo "--- Deploying... ---"
deploy
