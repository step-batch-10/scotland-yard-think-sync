FROM denoland/deno:2.2.11
WORKDIR /app
COPY . .
RUN deno install
CMD ["deno", "task", "start"]
