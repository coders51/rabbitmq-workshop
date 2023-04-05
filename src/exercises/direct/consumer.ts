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
  //Using yargs. To set the the queue pass as argument --queue <queue_number>
  //<queue_number>
  const argv = yargs(process.argv.slice(2))
    .options({
      queue: { type: "string", default: "1" },
    })
    .parseSync();
  console.log(argv.queue);
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();
  const exchangeName = "exchangeDirect";
  await channel.assertExchange(exchangeName, "direct");
  const { queue } = await channel.assertQueue(`queue ${argv.queue}`, {
    autoDelete: false,
    durable: true,
  });
  const rk = `rk${argv.queue}`;
  console.log(` [*] Waiting for messages in ${queue} - To exit press CTRL+C`);
  channel.bindQueue(queue, "exchangeDirect", rk);
  channel.consume(queue, msg => console.log(msg?.content.toString()));
}

main().then(
  () => console.log("Ok"),
  err => console.log("Error: ", err)
);
