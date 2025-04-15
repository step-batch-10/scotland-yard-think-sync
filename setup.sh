#! /bin/bash

rm -rf .git/hooks/pre-commit.sample
rm -rf .git/hooks/pre-push.sample
cp hooks/pre-commit .git/hooks
cp hooks/pre-push .git/hooks