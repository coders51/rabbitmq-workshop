import { connect } from "amqplib";
import { random } from "lodash";
import yargs from "yargs";

random();

export function wait(timeout: number) {
  return new Promise((res, _) => {
    return setTimeout(res, timeout);
  });
}
async function main() {
  const argv = yargs(process.argv.slice(2))
    .options({
      queue: { type: "string", default: "q1" },
      topic: { type: "string", default: "#" },
    })
    .parseSync();
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();
  const exchangeName = "topicExchange";
  await channel.assertExchange(exchangeName, "topic");
  const { queue } = await channel.assertQueue(argv.queue, {
    autoDelete: false,
    durable: true,
  });
  channel.bindQueue(queue, exchangeName, argv.topic);
  console.log(
    " [*] Waiting for messages with topic:",
    argv.topic,
    "on queue",
    queue,
    " - To exit press CTRL+C"
  );
  channel.consume(queue, msg => console.log(msg?.content.toString()));
}

main().then(
  () => console.log("Ok"),
  err => console.log("Error: ", err)
);
